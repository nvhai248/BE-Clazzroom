const jwt = require("jsonwebtoken");

const secret_key = process.env.SECRET_KEY;

class jwtAuth {
  extractBearerToken(authorizationHeader) {
    if (typeof authorizationHeader !== "string") {
      return null;
    }

    const parts = authorizationHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }

    return null;
  }

  verifyToken(token) {
    try {
      const payload = jwt.verify(token, secret_key);
      return payload;
    } catch (error) {
      return null;
    }
  }

  generateToken(data, expireTime) {
    var token = jwt.sign(data, secret_key, { expiresIn: expireTime });
    return token;
  }
}

module.exports = new jwtAuth();
