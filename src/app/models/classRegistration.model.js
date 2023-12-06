const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClassRegistration = new Schema(
  {
    class_id: { type: String },
    user_id: { type: String },
    role: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "class_registrations",
    timestamps: true,
  }
);

module.exports = mongoose.model("class_registrations", ClassRegistration);
