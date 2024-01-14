const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    final_grade: { type: Number },
    new_grade: { type: Number },
    type: { type: String },
    content: { type: String },
    user_id: { type: String },
    review_id: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "comments",
    timestamps: true,
  }
);

module.exports = mongoose.model("comments", Comment);
