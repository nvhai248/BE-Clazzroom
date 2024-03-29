const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GradeReview = new Schema(
  {
    class_id: { type: String },
    user_id: { type: String },
    student_id: { type: String },
    grade_composition_id: { type: String },
    grade_id: { type: String },
    state: { type: String },
    current_grade: { type: Number },
    expectation_grade: { type: Number },
    explanation: { type: String },
    comment_count: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "grade_reviews",
    timestamps: true,
  }
);

module.exports = mongoose.model("grade_reviews", GradeReview);
