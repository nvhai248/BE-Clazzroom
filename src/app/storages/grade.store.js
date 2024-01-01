const Grade = require("../models/grade.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeStore {
  createGrade = (gradeData) => {
    var newGrade = new Grade(gradeData);
    newGrade.save();
  };

  findGradeById = async (id) => {
    return mongooseHelper.mongoosesToObject(await Grade.findOne({ _id: id }));
  };

  updateGrade = async (id, gradeData) => {
    Grade.updateOne({ _id: id }, gradeData);
  };

  deleteGrade = async (id) => {
    Grade.deleteOne({ _id: id });
  };

  findGradesByStudentIdAndClassId = async (studentId, classId) => {
    return mongooseHelper.multiMongooseToObject(
      await Grade.find({ class_id: classId, student_id: studentId })
    );
  };
}

module.exports = new GradeStore();
