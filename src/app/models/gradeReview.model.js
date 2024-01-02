const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GradeReview = new Schema(
  {
    class_id: { type: String },
    student_id: { type: String },
    grade_composition_id: { type: String },
    state: { type: String },
    current_grade: { type: Number },
    expected_grade: { type: Number },
    expected_grade: { type: Number },
    user_explain: { type: String },
    comment_count: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "grade_reviews",
    timestamps: true,
  }
);

module.exports = mongoose.model("grade_reviews", GradeReview);
