const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BlackToken = new Schema(
  {
    userId: { type: String },
    token: { type: String },
    created_at: { type: String },
  },
  {
    collection: "black_tokens",
    timestamps: true,
  }
);

module.exports = mongoose.model("black_tokens", BlackToken);
