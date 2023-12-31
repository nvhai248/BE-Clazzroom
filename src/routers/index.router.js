const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");
const classRouter = require("./class.router");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");
const passport = require("passport");
const { OauthGGCheck, SetUserRequest } = require("../app/middlewares/ggOAuth");

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
  app.post("/api/login/check", passport.session(), OauthGGCheck);

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successMessage: "OK",
      session: true,
    }),
    SetUserRequest
  );
}

module.exports = Routers;
