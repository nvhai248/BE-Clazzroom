const userRouter = require("./user.router");
const uploadImageRouter = require("./image.router");

function Routers(app) {
  app.use("/api/users", userRouter);
  app.use("/api/uploads", uploadImageRouter);
  app.get("/api/", (req, res) => {
    res.send({ message: "Deploy Ok!" });
  });
}

module.exports = Routers;
