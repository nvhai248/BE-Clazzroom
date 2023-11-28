const Image = require("../models/image.model");

class imageStore {
  create = async (data) => {
    const image = new Image(data);
    image.save();
  };
}

module.exports = new imageStore();
