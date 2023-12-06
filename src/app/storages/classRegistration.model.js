const ClassRegistration = require("../models/classRegistration.model");
const mongooseHelper = require("../utils/mongoose.helper");

class ClassRegistrationStore {
  findListClassIdByUserId = async (userId) => {
    var _class = mongooseHelper.multiMongooseToObject(
      await ClassRegistration.find({ user_id: userId })
    );
    return _class;
  };

  createClassRegistration = async (classRegistrationInfo) => {
    var newRegistration = new ClassRegistration(classRegistrationInfo);
    await newRegistration.save();
  };

  deleteRegistration = async (classId, userId) => {
    ClassRegistration.deleteOne({ class_id: classId, user_id: userId });
  };
}

module.exports = new ClassRegistrationStore();
