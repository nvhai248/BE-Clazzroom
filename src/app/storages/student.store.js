const Student = require("../models/student.model");
const mongooseHelper = require("../utils/mongoose.helper");

class StudentStore {
  create = async (student) => {
    var isExisted = await Student.findOne({ student_id: student.student_id });

    if (isExisted) {
      throw new Error("Student Id already exists!");
    }

    await Student.create([student]);
  };

  findStudentsByClassId = async (classId) => {
    return mongooseHelper.multiMongooseToObject(
      await Student.find({ class_id: classId })
    );
  };

  deleteStudentByStudentIdAndClassId = async (studentId, classId) => {
    await Student.deleteOne({ student_id: studentId, class_id: classId });
  };

  findStudentByStudentIdAndClassId = async (studentId, classId) => {
    return mongooseHelper.mongoosesToObject(
      await Student.findOne({ student_id: studentId, class_id: classId })
    );
  };
}

module.exports = new StudentStore();
