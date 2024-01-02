const Student = require("../models/student.model");
const mongooseHelper = require("../utils/mongoose.helper");

class StudentStore {
  createOrUpdate = async (student, session) => {
    try {
      await Student.findOneAndUpdate(
        { student_id: student.student_id },
        { $setOnInsert: student },
        { upsert: true, session }
      );
    } catch (error) {
      throw new Error("Error creating or updating student!");
    }
  };
  

  findStudentsByClassId = async (classId) => {
    return mongooseHelper.multiMongooseToObject(
      await Student.find({ class_id: classId })
    );
  };

  deleteStudentByStudentIdAndClassId = async (studentId, classId, session) => {
    try {
      await Student.deleteOne({
        student_id: studentId,
        class_id: classId,
      }).session(session);
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  findStudentByStudentIdAndClassId = async (studentId, classId) => {
    return mongooseHelper.mongoosesToObject(
      await Student.findOne({ student_id: studentId, class_id: classId })
    );
  };
}

module.exports = new StudentStore();
