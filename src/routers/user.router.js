const express = require(`express`);
const router = express.Router();

const userRouter = require("../app/controllers/user.controller");
const authenticate = require("../app/middlewares/authenticate");
const uploadImage = require("../app/middlewares/uploadImage");

router.patch("/resetPw/:tokenForResetPw", userRouter.resetPw);
router.patch("/change-pw", authenticate, userRouter.changePw);
router.post("/send-email-renew-pw", userRouter.requireSendEmailRenewPw);
router.post(
  "/resend-verification",
  authenticate,
  userRouter.resendVerification
);
router.get("/verify/:verificationToken", userRouter.verifiedUser);
router.delete("/logout", authenticate, userRouter.logout);
router.patch("/profile", authenticate, userRouter.editProfile);
router.patch("/avatar", authenticate, uploadImage, userRouter.updatedAvatar);
router.get("/profile", authenticate, userRouter.getUser);
router.post("/register", userRouter.register);
router.post("/login", userRouter.login);

module.exports = router;
