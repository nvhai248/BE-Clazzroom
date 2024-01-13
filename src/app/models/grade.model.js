const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Grade = new Schema(
  {
    value: { type: Number },
    grade_composition_id: { type: String },
    student_id: { type: String },
    class_id: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "grades",
    timestamps: true,
  }
);

module.exports = mongoose.model("grades", Grade);
