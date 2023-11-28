const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Token = new Schema(
  {
    userId: { type: String },
    token: { type: String },
    created_at: { type: String },
  },
  {
    collection: "tokens",
    timestamps: true,
  }
);

module.exports = mongoose.model("tokens", Token);
