const userStore = require("../storages/user.store");
const hasher = require("../../configs/hasher");
const jwt = require("../../configs/jwt");
const tokenStore = require("../storages/token.store");
const { simpleSuccessResponse } = require("../views/response_to_client");
const {
  errorNotFound,
  errorCustom,
  errorBadRequest,
  errorInternalServer,
  errorUnauthorized,
  errNoPermission,
} = require("../views/error");
const { uploadToS3, isImage, getImageInfo } = require("../utils/image.helper");
const imageStore = require("../storages/image.store");
const {
  sendVerificationEmail,
  sendRenewPwEmail,
  sendRequireResetPw,
  sendRequireResetPwAfterChangePw,
} = require("../../configs/nodemailer");
const { generatePassword } = require("../utils/users.helper");
const blackTokenStore = require("../storages/blackToken.store");
const { publishMessage } = require("../../configs/pubsub_rabbitmq/publisher");

class USerController {
  // [GET] api/users/profile
  async getUser(req, res) {
    var userId = req.user.userId;
    const user = await userStore.findUserById(userId);
    if (!user) {
      res.status(404).send(errorNotFound("User"));
    }

    publishMessage("test", { data: "OK!" });

    res.status(200).send(simpleSuccessResponse(user, "ok"));
  }

  // register POST /api/users/register
  async register(req, res) {
    var data = req.body;
    if (!data.email) {
      return res.status(400).send(errorCustom(400, "Email is required"));
    }

    if (!data.password && !data.gg_id && !data.fb_id) {
      return res.status(400).send(errorCustom(400, "Password is required"));
    }

    const existingUser = await userStore.findUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).send(errorCustom(400, "Email already exists!"));
    }

    data.is_verified = false;
    data.password = data.password
      ? (data.password = hasher.encode(data.password))
      : "";
    data.status = true;
    await userStore.createUser(data);

    const newUser = await userStore.findUserByEmail(data.email);
    var verificationToken = jwt.generateToken({ userId: newUser._id }, "1h");

    sendVerificationEmail(data.email, verificationToken)
      .then(() => {
        return res.status(201).send(errorCustom(201, "Sign up successful!"));
      })
      .catch((error) => {
        console.log("Error: ", error);
        return res.status(201).send(errorCustom(201, "Sign up successful!"));
      });
  }

  // login POST /api/users/login
  async login(req, res) {
    const data = req.body;

    const user = await userStore.findUserByEmail(data.email);

    if (!user || !hasher.compare(user.password, data.password)) {
      return res
        .status(401)
        .send(errorCustom(401, "Email or password incorrect!"));
    }

    const token = jwt.generateToken(
      { userId: user._id, role: user.role },
      "7d"
    );
    // if user re-login save new token
    // else create new token in database

    tokenStore.createToken({
      token: token,
      userId: user._id,
    });

    res
      .status(201)
      .send(
        simpleSuccessResponse(
          { token: token, user: user },
          "Sign in successfully!"
        )
      );
  }

  // [PATCH] /api/users/profile
  async editProfile(req, res) {
    const userId = req.user.userId;
    const data = req.body;

    if (!userId || !data) {
      res.status(400).send(errorBadRequest("Invalid profile!"));
    }

    await userStore.editProfile(userId, data);
    const newData = await userStore.findUserById(userId);
    res
      .status(200)
      .send(simpleSuccessResponse(newData, "Successfully updated profile!"));
  }

  // [DELETE] /api/users/logout
  async logout(req, res) {
    const authorizationHeader = req.header("Authorization");
    let tokenStr = "";
    const parts = authorizationHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      tokenStr = parts[1];
    }

    tokenStore.deleteTokenByTokenStr(tokenStr);
    res.status(200).send(simpleSuccessResponse(null, "Sign out successfully!"));
  }

  // [PATCH] /api/users/avatar
  updatedAvatar = async (req, res, next) => {
    if (!req.file) {
      res.status(400).send(errorCustom(400, "Uploaded file not found!"));
    }

    const buffer = req.file.buffer;
    const url = "imgs/" + Date.now() + "-" + req.file.originalname;

    if (!isImage(buffer)) {
      return res
        .status(400)
        .send(errorCustom(400, "Uploaded file must be an image!"));
    }

    var imageInfo = getImageInfo(buffer, url);

    // Upload file to AWS S3
    let check = await uploadToS3(imageInfo, buffer);
    if (check) {
      // return image information to Client
      imageInfo.url = process.env.S3Domain + "/" + imageInfo.url;
      var userId = req.user.userId;
      imageInfo.created_by = userId;

      imageStore.create(imageInfo);
      await userStore.editProfile(userId, { image: imageInfo.url });
      var user = await userStore.findUserById(userId);
      res
        .status(200)
        .send(simpleSuccessResponse(user, "Successfully updated!"));
    } else {
      res
        .status(500)
        .send(errorInternalServer("Something went wrong when upload image!"));
    }
  };

  // [POST] /api/users/verify
  verifiedUser = async (req, res) => {
    var { token } = req.body;
    if (!token) {
      return res.status(400).send(errorBadRequest("Invalid token!"));
    }

    const checkIsBlock = await blackTokenStore.findByToken(token);
    if (checkIsBlock) {
      return res.status(400).send(errorBadRequest("Token blocked!"));
    }

    var payload = jwt.verifyToken(token);
    if (!payload) {
      return res.status(401).send(errorUnauthorized());
    }
    userStore.editProfile(payload.userId, { is_verified: true });

    blackTokenStore.createToken({
      userId: payload.userId,
      token: token,
    });

    return res.status(200).json({
      status: 200,
      message: "Verified",
    });
  };

  // [POST] /api/users/resend-verification
  resendVerification = async (req, res) => {
    var userId = req.user.userId;
    var verificationToken = jwt.generateToken({ userId: userId }, "1h");

    var user = await userStore.findUserById(userId);

    sendVerificationEmail(user.email, verificationToken)
      .then(() => {
        res
          .status(200)
          .json({ message: "Resend verification email successfully!" });
      })
      .catch((error) => {
        res
          .status(403)
          .send(errorCustom(403, "Can't send verification email!"));
      });
  };

  // [POST] /api/users/send-email-renew-pw
  requireSendEmailRenewPw = async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send(errorBadRequest("Invalid email!"));
    }

    var user = await userStore.findUserByEmail(email);
    if (!user) {
      return res.status(400).send(errorBadRequest("Email not found!"));
    }

    var newPw = generatePassword();

    // after resend email delete all black tokens
    blackTokenStore.deleteTokensByUserId(user._id);

    sendRenewPwEmail(user.email, newPw)
      .then(() => {
        userStore.editProfile(user._id, { password: hasher.encode(newPw) });
        res.status(200).json({ message: "Send email successfully!" });
      })
      .catch((error) => {
        res.status(403).send(errorCustom(403, "Can't send  email!"));
      });
  };

  // [PATCH] /api/users/change-pw
  changePw = async (req, res) => {
    const { password, newPassword } = req.body;

    const userInfo = req.user;

    var user = await userStore.findUserById(userInfo.userId);
    if (!user) {
      return res.status(403).send(errorCustom(403, "User not found!"));
    }

    if (!hasher.compare(user.password, password)) {
      return res.status(403).send(errorCustom(403, "Password is incorrect!"));
    }

    var newPw = hasher.encode(newPassword);
    userStore.editProfile(userInfo.userId, { password: newPw });

    var tokenForResetPw = jwt.generateToken({ userId: userInfo.userId }, "1d");

    sendRequireResetPwAfterChangePw(user.email, tokenForResetPw)
      .then(() => {
        return res
          .status(200)
          .json({ message: "Password changed successfully!" });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(200)
          .json({ message: "Password changed successfully!" });
      });
  };

  // [PATCH] /api/users/resetPw
  resetPw = async (req, res) => {
    const { newPassword, token } = req.body;
    const checkIsBlock = await blackTokenStore.findByToken(token);
    // if token in the black list => return error
    if (checkIsBlock) {
      return res.status(403).send(errorCustom(403, "Token is blocked!"));
    }

    const payload = jwt.verifyToken(token);

    if (!payload) {
      return res
        .status(401)
        .send(errorCustom(401, "The token for reset password is not valid!"));
    }

    userStore.editProfile(payload.userId, {
      password: hasher.encode(newPassword),
    });

    blackTokenStore.createToken({ userId: payload.userId, token: token });

    res.status(200).json({ message: "Reset password successfully!" });
  };

  // [POST] facebook-oauth
  facebookOAuth = async (req, res) => {
    const data = req.body;

    // find user by fb_id
    var user = await userStore.findUserByFbId(data.fb_id);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized!",
      });
    }

    // if find user
    const token = jwt.generateToken(
      {
        userId: user._id,
        role: user.role,
      },
      "7d"
    );

    tokenStore.createToken({ userId: user._id, token: token });
    return res.status(200).json({
      message: "Login successful!",
      token: token,
      user: user,
    });
  };

  // [POST] google-oauth
  googleOAuth = async (req, res) => {
    const data = req.body;

    // find user by gg_id
    var user = await userStore.findUserByGgId(data.gg_id);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized!",
      });
    }

    // if find user
    const token = jwt.generateToken(
      {
        userId: user._id,
        role: user.role,
      },
      "7d"
    );

    tokenStore.createToken({ userId: user._id, token: token });
    return res.status(200).json({
      message: "Login successful!",
      token: token,
      user: user,
    });
  };

  // [POST] /api/users/send-email-reset-pw
  requireSendEmailResetPw = async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send(errorBadRequest("Invalid email!"));
    }

    var user = await userStore.findUserByEmail(email);
    if (!user) {
      return res.status(400).send(errorBadRequest("Email not found!"));
    }

    // after resend email delete all black tokens
    blackTokenStore.deleteTokensByUserId(user._id);

    var tokenForResetPw = jwt.generateToken({ userId: user._id }, "1d");

    sendRequireResetPw(user.email, tokenForResetPw)
      .then(() => {
        res.status(200).json({ message: "Send email successfully!" });
      })
      .catch((error) => {
        res.status(403).send(errorCustom(403, "Can't send  email!"));
      });
  };

  // {GET} /api/users
  getAllUser = async (req, res) => {
    var users = await userStore.getUsers();
    res.status(200).send(simpleSuccessResponse(users, "Successfully!"));
  };

  // {PATCH} /api/users/:id/banned
  bannedAccount = async (req, res) => {
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).send(errorBadRequest("Invalid account id!"));
    }

    var account = await userStore.findUserById(accountId);

    if (account.role == "admin") {
      return res.status(403).send(errNoPermission("You can't ban admin!"));
    }

    if (account.status == false) {
      return res.status(400).send(errorBadRequest("Account already banned!"));
    }

    userStore.editProfile(accountId, { status: false });
    res
      .status(200)
      .send(simpleSuccessResponse(null, `Account ${accountId} banned!`));
  };

  // {PATCH} /api/users/:id/unbanned
  unbannedAccount = async (req, res) => {
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).send(errorBadRequest("Invalid account id!"));
    }

    var account = await userStore.findUserById(accountId);

    if (account.role == "admin") {
      return res.status(403).send(errNoPermission("You can't unbanned admin!"));
    }

    if (account.status == true) {
      return res.status(400).send(errorBadRequest("Account already unbanned!"));
    }

    userStore.editProfile(accountId, { status: true });
    res
      .status(200)
      .send(simpleSuccessResponse(null, `Account ${accountId} unbanned!`));
  };
}

module.exports = new USerController();
