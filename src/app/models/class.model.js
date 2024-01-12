const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Class = new Schema(
  {
    class_name: { type: String },
    description: { type: String },
    class_code: { type: String },
    status: { type: String },
    room: { type: String },
    topic: { type: String },
    student_count: { type: Number },
    teacher_count: { type: Number },
    owner: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "classes",
    timestamps: true,
  }
);

module.exports = mongoose.model("classes", Class);
