const GradeReview = require("../models/gradeReview.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeReviewStore {
  create = async (gradeReviewData) => {
    GradeReview.create([gradeReviewData]);
  };

  getListByStateAndClassId = async (state, classId) => {
    return mongooseHelper.multiMongooseToObject(
      await GradeReview.find({ class_id: classId, state: state })
    );
  };

  getReviewById = async (id) => {
    return mongooseHelper.mongoosesToObject(
      await GradeReview.findOne({ _id: id })
    );
  };
}

module.exports = new GradeReviewStore();