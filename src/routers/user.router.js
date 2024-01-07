const express = require(`express`);
const router = express.Router();

const userRouter = require("../app/controllers/user.controller");
const authenticate = require("../app/middlewares/authenticate");
const uploadImage = require("../app/middlewares/uploadImage");
const {
  RequireRoleAdmin,
  RequireNotBanned,
} = require("../app/middlewares/require");

// admin
router.get(
  "/",
  authenticate,
  RequireRoleAdmin,
  RequireNotBanned,
  userRouter.getAllUser
);

router.patch(
  "/:id/banned",
  authenticate,
  RequireRoleAdmin,
  RequireNotBanned,
  userRouter.bannedAccount
);

router.patch(
  "/:id/unbanned",
  authenticate,
  RequireRoleAdmin,
  RequireNotBanned,
  userRouter.unbannedAccount
);

router.post("/send-email-reset-pw", userRouter.requireSendEmailResetPw);
router.post("/google-oauth", userRouter.googleOAuth);
router.post("/facebook-oauth", userRouter.facebookOAuth);
router.patch("/resetPw", userRouter.resetPw);
router.patch("/change-pw", authenticate, userRouter.changePw);
router.post("/send-email-renew-pw", userRouter.requireSendEmailRenewPw);
router.post(
  "/resend-verification",
  authenticate,
  userRouter.resendVerification
);
router.post("/verify", userRouter.verifiedUser);
router.delete("/logout", authenticate, userRouter.logout);
router.patch("/profile", authenticate, userRouter.editProfile);
router.patch("/avatar", authenticate, uploadImage, userRouter.updatedAvatar);
router.get("/profile", authenticate, userRouter.getUser);
router.post("/register", userRouter.register);
router.post("/login", userRouter.login);

module.exports = router;
