const ClassRegistration = require("../models/classRegistration.model");
const mongooseHelper = require("../utils/mongoose.helper");

class ClassRegistrationStore {
  findListStudentIdInClassByClassId = async (classId) => {
    var students = mongooseHelper.multiMongooseToObject(
      await ClassRegistration.find({ class_id: classId })
    );
    return students;
  };

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