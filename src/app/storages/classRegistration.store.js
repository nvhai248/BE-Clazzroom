const ClassRegistration = require("../models/classRegistration.model");
const mongooseHelper = require("../utils/mongoose.helper");

class ClassRegistrationStore {
  findByClassIdAndUserId = async (classId, userId) => {
    var registration = mongooseHelper.mongoosesToObject(
      await ClassRegistration.findOne({ class_id: classId, user_id: userId })
    );

    return registration;
  };

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
    await ClassRegistration.deleteOne({ class_id: classId, user_id: userId });
  };

  findClassRegistrationsByClassIdAndRole = async (classId, role) => {
    let query = {
      class_id: classId,
    };
    if (role == "student" || role == "teacher") {
      query.role = role;
    }

    return mongooseHelper.multiMongooseToObject(
      await ClassRegistration.find(query)
    );
  };
}

module.exports = new ClassRegistrationStore();
