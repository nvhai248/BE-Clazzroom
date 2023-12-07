const classRegistrationModel = require("../models/classRegistration.model");
const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const { errorBadRequest } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class ClassController {
  //[POST] /classes/
  createNewClass = async (req, res) => {
    var data = req.body;

    if (!data) {
      return res.status(400).send(errorBadRequest("Invalid request!"));
    }

    // set default class
    data.owner = req.user.userId;
    data.student_count = 0;
    data.teacher_count = 0;

    var newClass = await classStore.createClass(data);
    classRegistrationStore.createClassRegistration({
      class_id: newClass._id,
      user_id: newClass.owner,
      role: "teacher",
    });

    res
      .status(200)
      .send(
        simpleSuccessResponse(newClass, "Successfully create a new class!")
      );
  };
}

module.exports = new ClassController();
