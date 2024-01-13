const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GradeComposition = new Schema(
  {
    name: { type: String },
    order: { type: Number },
    scale: { type: Number },
    state: { type: String },
    class_id: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "grade_compositions",
    timestamps: true,
  }
);

module.exports = mongoose.model("grade_compositions", GradeComposition);
