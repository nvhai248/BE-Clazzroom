const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");
const classRouter = require("./class.router");
const reviewRouter = require("./review.router");
const notificationRouter = require("./notification.router");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");
const passport = require("passport");
const { OauthGGCheck, SetUserRequest } = require("../app/middlewares/ggOAuth");

function Routers(app) {
  app.use("/api/classes", classRouter);
  app.use("/api/users", userRouter);
  app.use("/api/uploads", uploadImageRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/notifications", notificationRouter);
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

  app.get("/api/login/check", passport.session(), OauthGGCheck);

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureMessage: "Cannot login, please try again!",
      successMessage: "OK",
      session: true,
    }),
    SetUserRequest
  );
}

module.exports = Routers;
