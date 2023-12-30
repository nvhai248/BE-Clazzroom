const Grade = require("../models/grade.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeStore {
    // implement here
  test = () => {
    console.log("OK");
  };
}

module.exports = new GradeStore();
