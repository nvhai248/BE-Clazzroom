const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    content: { type: String },
    state: { type: String },
    class: { type: String },
    url: { type: String },
    to_user: { type: String },
    created_at: { type: String },
  },
  {
    collection: "notifications",
    timestamps: true,
  }
);

module.exports = mongoose.model("notifications", Notification);
