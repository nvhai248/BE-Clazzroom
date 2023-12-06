const User = require("../models/user.model");
const mongooseHelper = require("../utils/mongoose.helper");

class userStore {
  findListUserById = async (ids) => {
    var users = [];

    for (let i = 0; i < ids.length; i++) {
      users.push(
        mongooseHelper.mongoosesToObject(await User.findOne({ _id: ids[i] }))
      );
    }

    return users;
  };

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

    return mongooseHelper.mongoosesToObject(newUser);
  };

  editProfile = async (userId, data) => {
    await User.updateOne({ _id: userId }, data);
  };

  editProfileByEmail = async (email, data) => {
    await User.updateOne({ _id: email }, data);
  };
}

module.exports = new userStore();
