const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");
const classRouter = require("./class.router");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");
const passport = require("passport");
const {
  OauthGGSuccess,
  OauthGGFailure,
  OauthGGCheck,
} = require("../app/middlewares/ggOAuth");

function Routers(app) {
  app.use("/api/classes", classRouter);
  app.use("/api/users", userRouter);
  app.use("/api/uploads", uploadImageRouter);
  app.get("/api/", (req, res) => {
    res.send({ message: "Deploy Ok!" });
  });

  // swagger
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerDocument));

  // google auth
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  app.get("/login/fail", OauthGGFailure);
  app.get("/login/success", OauthGGSuccess);
  app.get("/api/login/check", OauthGGCheck);

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: `${process.env.DOMAIN_CLIENT}/`,
      successMessage: "OK",
      failureRedirect: "/login/fail",
    })
  );
}

module.exports = Routers;
