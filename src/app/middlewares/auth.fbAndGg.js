const jwt = require("../../configs/jwt");
const tokenStore = require("../storages/token.store");
const { errorInternalServer } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

module.exports = async (req, res) => {
  var token = jwt.generateToken(req.user);
  try {
    await tokenStore.createToken({
      token: token,
      userId: req.user.userId,
    });
    res
      .status(200)
      .send(simpleSuccessResponse(token, "Sign in with Facebook!"));
  } catch (err) {
    res.status(500).send(errorInternalServer(err));
  }
};
