const jwt = require("../../configs/jwt");
const tokenStore = require("../storages/token.store");
const userStore = require("../storages/user.store");
const {
  errorInternalServer,
  errorUnauthorized,
  errorBadRequest,
} = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

function SetUserRequest(req, res, next) {
  if (req.user) {
    console.log(req.user);
    res.redirect(`${process.env.DOMAIN_CLIENT}/`);
  } else {
    res.redirect(`${process.env.DOMAIN_CLIENT}/`);
  }
}

async function OauthGGCheck(req, res) {
  if (!req.user) {
    return res.status(400).send(errorBadRequest("Something went wrong!"));
  }

  var token = jwt.generateToken(req.user, "7d");

  await tokenStore.createToken({
    token: token,
    userId: req.user.userId,
  });

  var user = await userStore.findUserById(req.user.userId);

  req.logout((error) => console.log(error));

  res
    .status(200)
    .send(simpleSuccessResponse({ token: token, user: user }, "OK"));
}

module.exports = {
  OauthGGCheck,
  SetUserRequest,
};
