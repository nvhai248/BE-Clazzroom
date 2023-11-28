const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");
const passport = require("passport");
const oauthFbAndGg = require("../app/middlewares/auth.fbAndGg");

function Routers(app) {
  app.use("/api/user", userRouter);
  app.use("/api/upload", uploadImageRouter);
  app.get("/api/", (req, res) => {
    res.send({ message: "Deploy Ok!" });
  });
  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["public_profile", "email"] })
  );

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      session: true,
      /* successRedirect: `${process.env.DOMAIN_CLIENT}`,
      failureRedirect: `${process.env.DOMAIN_CLIENT}`,
      failureMessage: "Sign in with Facebook Failed!",
      successMessage: "OK", */
    }),
    oauthFbAndGg
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: true,
      /* successRedirect: `${process.env.DOMAIN_CLIENT}`,
      failureRedirect: `${process.env.DOMAIN_CLIENT}`,
      failureMessage: "Sign in with Facebook Failed!",
      successMessage: "OK", */
    }),
    oauthFbAndGg
  );
}

module.exports = Routers;
