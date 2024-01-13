const GradeReview = require("../models/gradeReview.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeReviewStore {
  create = async (gradeReviewData) => {
    return await GradeReview.create([gradeReviewData]);
  };

  deleteAllByClassId = async (classId) => {
    await GradeReview.deleteMany({ class_id: classId });
  };

  getListByStateAndClassId = async (userId, state, classId, sort) => {
    let query = {};

    if (userId) {
      query = {
        user_id: userId,
      };
    }

    if (state) {
      query.state = state;
    }

    if (classId) {
      query.class_id = classId;
    }

    let sortOptions = {};

    if (sort === "des_last_updated") {
      sortOptions = { updated_at: -1 };
    } else if (sort === "asc_last_updated") {
      sortOptions = { updated_at: 1 };
    }

    let gradeReviewsQuery = GradeReview.find(query);

    if (Object.keys(sortOptions).length !== 0) {
      gradeReviewsQuery = gradeReviewsQuery.sort(sortOptions);
    }

    return mongooseHelper.multiMongooseToObject(await gradeReviewsQuery);
  };

  getReviewById = async (id) => {
    return mongooseHelper.mongoosesToObject(
      await GradeReview.findOne({ _id: id })
    );
  };

  updateReviewDataById = async (id, data) => {
    await GradeReview.updateOne({ _id: id }, data);
  };

  getReviewByClassIdStudentIdAndGradeCompId = async (
    StudentId,
    GradeCompId,
    ClassID
  ) => {
    return mongooseHelper.mongoosesToObject(
      await GradeReview.findOne({
        student_id: StudentId,
        grade_composition_id: GradeCompId,
        class_id: ClassID,
      })
    );
  };

  increaseCommentCountById = async (id) => {
    await GradeReview.updateOne({ _id, id }, { $inc: { comment_count: 1 } });
  };
}

module.exports = new GradeReviewStore();
