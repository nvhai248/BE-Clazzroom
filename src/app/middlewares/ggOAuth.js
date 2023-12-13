const jwt = require("../../configs/jwt");
const tokenStore = require("../storages/token.store");
const { errorInternalServer, errorUnauthorized } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

OauthGGSuccess = async (req, res) => {
  var token = jwt.generateToken(req.user, "7d");
  try {
    await tokenStore.createToken({
      token: token,
      userId: req.user.userId,
    });
    res
      .status(200)
      .send(simpleSuccessResponse({ token: token, user: req.user }, "OK"));
  } catch (err) {
    res.status(500).send(errorInternalServer(err));
  }
};

OauthGGFailure = async (req, res) => {
  res.status(401).send(errorUnauthorized());
};

module.exports = { OauthGGSuccess, OauthGGFailure };
