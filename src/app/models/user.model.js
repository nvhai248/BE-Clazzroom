const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema(
  {
    full_name: { type: String },
    password: { type: String },
    fb_id: { type: String },
    gg_id: { type: String },
    email: { type: String },
    phone_number: { type: String },
    student_id: { type: String },
    birthday: { type: String },
    social_id: { type: String },
    address: { type: String },
    image: { type: String },
    role: { type: String },
    status: { type: Boolean },
    is_verified: { type: Boolean },
    created_at: { type: String },
    updated_at: { type: String },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

module.exports = mongoose.model("users", User);
