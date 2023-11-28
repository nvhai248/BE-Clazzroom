const Token = require("../models/token.model");
const mongooseHelper = require("../utils/mongoose.helper");

class tokenStore {
  findTokenByTokenStr = async (tokenStr) => {
    var token = mongooseHelper.mongoosesToObject(
      await Token.findOne({ token: tokenStr })
    );

    return token;
  };

  findTokenByUsername = async (username) => {
    var token = mongooseHelper.mongoosesToObject(
      await Token.findOne({ username: username })
    );

    return token;
  };

  createToken = async (token) => {
    var newToken = new Token(token);
    await newToken.save();
  };

  deleteTokenByTokenStr = async (tokenStr) => {
    await Token.deleteOne({ token: tokenStr });
  };

  updateToken = async (tokenStr, userId) => {
    await Token.updateOne({ user_id: userId }, { token: tokenStr });
  };
}

module.exports = new tokenStore();
