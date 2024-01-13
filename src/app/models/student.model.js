const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Student = new Schema(
  {
    class_id: { type: String },
    student_id: { type: String },
    full_name: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "students",
    timestamps: true,
  }
);

module.exports = mongoose.model("students", Student);
