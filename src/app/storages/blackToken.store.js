const BlackToken = require("../models/blackToken.model");
const mongooseHelper = require("../utils/mongoose.helper");

class blackTokenStore {
  findByToken = async (tokenStr) => {
    var token = mongooseHelper.mongoosesToObject(
      await BlackToken.findOne({ token: tokenStr })
    );

    return token;
  };

  createToken = async (BToken) => {
    var newToken = new BlackToken(BToken);
    await newToken.save();
  };

  deleteTokenByTokenStr = async (tokenStr) => {
    await BlackToken.deleteOne({ token: tokenStr });
  };

  deleteTokensByUserId = async (userId) => {
    await BlackToken.deleteMany({ userId: userId });
  };
}

module.exports = new blackTokenStore();
