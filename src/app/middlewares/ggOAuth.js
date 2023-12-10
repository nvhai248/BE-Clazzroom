const jwt = require("../../configs/jwt");
const tokenStore = require("../storages/token.store");
const { errorInternalServer } = require("../views/error");

module.exports = async (req, res) => {
  var token = jwt.generateToken(req.user, "7d");
  try {
    await tokenStore.createToken({
      token: token,
      userId: req.user.userId,
    });
    res.redirect(`${process.env.DOMAIN_CLIENT}/?token=${token}`);
  } catch (err) {
    res.status(500).send(errorInternalServer(err));
  }
};
