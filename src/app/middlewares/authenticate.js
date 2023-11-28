const passport = require("passport");
const tokenStore = require("../storages/token.store");
const { errorCustom, errorInternalServer } = require("../views/error");
const jwtConfig = require("../../configs/jwt");

module.exports = async function Authenticated(req, res, next) {
  var token = req.header("Authorization");
  // get and split token
  token = jwtConfig.extractBearerToken(token);
  if (!token) return res.status(401).send(errorCustom(401, "Invalid token!"));

  const tokenExists = await tokenStore.findTokenByTokenStr(token);
  if (!tokenExists) {
    return res.status(403).send(errorCustom(401, "Token is expired!"));
  }

  passport.authenticate("jwt", { session: true }, (err, user) => {
    if (err) {
      console.error("Error checking token:", err);
      return res.status(500).send(errorInternalServer(err));
    }
    if (!user) {
      return res.status(401).send(errorCustom(401, "Unauthorized!"));
    }
    req.user = user;
    next();
  })(req, res, next);
};
