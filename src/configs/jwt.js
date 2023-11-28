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

  generateToken(data) {
    var token = jwt.sign(data, secret_key, { expiresIn: "7d" });
    return token;
  }

  generateVerificationToken(data) {
    var token = jwt.sign(data, secret_key, { expiresIn: "1h" });
    return token;
  }
}

module.exports = new jwtAuth();
