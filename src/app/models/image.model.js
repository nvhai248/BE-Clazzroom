const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Image = new Schema(
  {
    url: { type: String },
    width: { type: Number },
    height: { type: Number },
    cloud_name: { type: String },
    extension: { type: String },
    created_by : { type: String },
  },
  {
    collection: "images",
    timestamps: true,
  }
);

module.exports = mongoose.model("images", Image);
