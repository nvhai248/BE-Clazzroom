const User = require("../models/user.model");
const mongooseHelper = require("../utils/mongoose.helper");

class userStore {
  findUserByEmail = async (email) => {
    var user = mongooseHelper.mongoosesToObject(
      await User.findOne({ email: email })
    );
    return user;
  };

  findUserById = async (id) => {
    var user = mongooseHelper.mongoosesToObject(
      await User.findOne({ _id: id })
    );
    return user;
  };

  findUserByFbId = async (fb_id) => {
    var user = mongooseHelper.mongoosesToObject(
      await User.findOne({ fb_id: fb_id })
    );
    return user;
  };

  findUserByGgId = async (gg_id) => {
    var user = mongooseHelper.mongoosesToObject(
      await User.findOne({ gg_id: gg_id })
    );
    return user;
  };

  createUser = async (user) => {
    if (!user.role) {
      user.role = "not_set";
    }
    var newUser = new User(user);
    await newUser.save();
  };

  createUserAndReturn = async (user) => {
    if (!user.role) {
      user.role = "not_set";
    }

    var newUser = new User(user);
    await newUser.save();
    return newUser;
  };

  editProfile = async (userId, data) => {
    await User.updateOne({ _id: userId }, data);
  };
}

module.exports = new userStore();
