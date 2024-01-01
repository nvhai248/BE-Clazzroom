const Student = require("../models/student.model");
const mongooseHelper = require("../utils/mongoose.helper");

class StudentStore {
  create = async (student) => {
    Student.create([student]);
  };

  findStudentsByClassId = async (classId) => {
    return mongooseHelper.multiMongooseToObject(
      await Student.find({ class_id: classId })
    );
  };
}

module.exports = new StudentStore();
