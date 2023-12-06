const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");
const classRouter = require("./class.router");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");

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
}

module.exports = Routers;
