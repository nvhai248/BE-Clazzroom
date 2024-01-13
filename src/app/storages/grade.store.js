const Grade = require("../models/grade.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeStore {
  findGradeById = async (id) => {
    return mongooseHelper.mongoosesToObject(await Grade.findOne({ _id: id }));
  };

  createOrUpdateGrade = async (gradeData, session) => {
    try {
      const options = {
        new: true,
        upsert: true,
        session,
        setDefaultsOnInsert: true,
      };

      return await Grade.findOneAndUpdate(
        {
          grade_composition_id: gradeData.grade_composition_id,
          student_id: gradeData.student_id,
          class_id: gradeData.class_id,
        },
        { $set: gradeData },
        options
      );
    } catch (error) {
      throw new Error("Error creating or updating grade!");
    }
  };

  deleteGrade = async (id) => {
    Grade.deleteOne({ _id: id });
  };

  findGradesByStudentIdAndClassId = async (studentId, classId) => {
    return mongooseHelper.multiMongooseToObject(
      await Grade.find({ class_id: classId, student_id: studentId })
    );
  };

  findGradeByStudentIdAndClassIdAndGradeCompositionId = async (
    studentId,
    classId,
    gradeCompositionId
  ) => {
    return mongooseHelper.mongoosesToObject(
      await Grade.findOne({
        class_id: classId,
        student_id: studentId,
        grade_composition_id: gradeCompositionId,
      })
    );
  };

  updateById = async (gradeId, newData) => {
    await Grade.updateOne({ _id: gradeId }, newData);
  };

  deleteAllByStudentIdAndClassId = async (studentId, classId) => {
    await Grade.deleteMany({ student_id: studentId, class_id: classId });
  };

  deleteAllByClassId = async (classId) => {
    await Grade.deleteMany({ class_id: classId });
  };
}

module.exports = new GradeStore();
