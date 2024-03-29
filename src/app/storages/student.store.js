const Student = require("../models/student.model");
const mongooseHelper = require("../utils/mongoose.helper");

class StudentStore {
  createOrUpdate = async (student) => {
    return await Student.create([student]);
  };

  deleteAllStudentInClass = async (classId) => {
    await Student.deleteMany({ class_id: classId });
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

  findStudentById = async (id) => {
    return mongooseHelper.mongoosesToObject(await Student.findOne({ _id: id }));
  };

  updateStudentInfoById = async (id, studentInfo, session) => {
    if (
      await Student.findOne({
        student_id: studentInfo.student_id,
        class_id: studentInfo.class_id,
      })
    ) {
      throw new Error("Student info already existed!");
    }

    await Student.updateOne({ _id: id }, studentInfo, { session });
  };
}

module.exports = new StudentStore();
