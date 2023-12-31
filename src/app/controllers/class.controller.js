const { response } = require("express");
const { sendInvitationToTheClass } = require("../../configs/nodemailer");
const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const userStore = require("../storages/user.store");
const { generateRandomClassCode } = require("../utils/class.helper");
const {
  errorBadRequest,
  errorCustom,
  errNoPermission,
} = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class ClassController {
  //[GET] /classes
  getListClasses = async (req, res) => {
    var user = req.user;

    let registrations = await classRegistrationStore.findListClassIdByUserId(
      user.userId
    );

    let result = [];
    for (var i = 0; i < registrations.length; i++) {
      var _class = await classStore.findClassById(registrations[i].class_id);
      var owner = await userStore.findUserById(_class.owner);
      delete owner.password;
      _class.owner = owner;
      result.push(_class);
    }

    res.status(200).send(simpleSuccessResponse(result, "Success!"));
  };

  //[POST] /classes/
  createNewClass = async (req, res) => {
    var data = req.body;

    if (!data) {
      return res.status(400).send(errorBadRequest("Invalid request!"));
    }

    // set default class
    data.owner = req.user.userId;
    data.student_count = 0;
    data.teacher_count = 1;
    data.class_code = generateRandomClassCode(8);

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

  // [GET] /classes/:id
  findClass = async (req, res) => {
    var id = req.params.id;

    var myClass = await classStore.findClassById(id);

    const joinedUsers =
      await classRegistrationStore.findListStudentIdInClassByClassId(id);

    var teachers = [];
    var students = [];

    // add members in class
    for (let i = 0; i < joinedUsers.length; i++) {
      if (joinedUsers[i].role === "teacher") {
        const teacherInfo = await userStore.findUserById(
          joinedUsers[i].user_id
        );
        teachers.push({
          _id: teacherInfo._id,
          full_name: teacherInfo.full_name,
          email: teacherInfo.email,
          image: teacherInfo.image,
        });
      } else if (joinedUsers[i].role === "student") {
        const studentInfo = await userStore.findUserById(
          joinedUsers[i].user_id
        );
        students.push({
          _id: studentInfo._id,
          full_name: studentInfo.full_name,
          email: studentInfo.email,
          image: studentInfo.image,
          student_id: joinedUsers[i].student_id,
        });
      }
    }

    myClass.teachers = teachers;
    myClass.students = students;

    let owner = await userStore.findUserById(myClass.owner);
    delete owner.password;
    myClass.owner = owner;
    res.status(200).send(simpleSuccessResponse(myClass, "success!"));
  };

  // [POST] /classes/join
  joinClass = async (req, res) => {
    const user = req.user;
    const { class_code } = req.body;

    if (!class_code) {
      return res.status(400).send(errorBadRequest("Invalid request"));
    }

    const myClass = await classStore.findClassByClassCode(class_code);
    if (!myClass) {
      return res.status(404).send(errorCustom(404, "Class not found!"));
    }

    const isJoined = await classRegistrationStore.findByClassIdAndUserId(
      myClass._id,
      user.userId
    );

    if (isJoined) {
      return res
        .status(400)
        .send(errorCustom(400, "You are already a member of class!"));
    }

    classRegistrationStore.createClassRegistration({
      class_id: myClass._id,
      user_id: user.userId,
      role: user.role,
    });

    if (user.role === "student") {
      classStore.increaseStudentCount(myClass._id);
    } else if (user.role === "teacher") {
      classStore.increaseTeacherCount(myClass._id);
    }

    res
      .status(200)
      .send(simpleSuccessResponse(null, "Successfully joined class!"));
  };

  // [POST] /classes/:id/request-send-invitation
  requestSendInvitation = async (req, res) => {
    const user = req.user;

    const emails = req.body;

    const id = req.params.id;

    if (!emails || !id) {
      return res.status(400).send(errorBadRequest("Invalid request"));
    }

    const myClass = await classStore.findClassById(id);
    if (!myClass) {
      return res.status(404).send(errorCustom(404, "Class not found!"));
    }

    const userInfo = await userStore.findUserById(user.userId);

    if (!userInfo) {
      return res.status(400).send(errorCustom(404, "User not found!"));
    }

    for (let i = 0; i < emails.length; i++) {
      sendInvitationToTheClass(userInfo, emails[i].email, myClass);
    }

    res
      .status(200)
      .send(simpleSuccessResponse(null, "Send Invitation Success!"));
  };

  // [PATCH] /classes/:id
  editClassProfile = async (req, res) => {
    const newData = req.body;

    const id = req.params.id;

    if (!newData || !id) {
      return res.status(400).send(errorBadRequest("Invalid request"));
    }

    const myClass = await classStore.findClassById(id);
    if (!myClass) {
      return res.status(404).send(errorCustom(404, "Class not found!"));
    }

    classStore.updateClass(id, newData);

    res.status(200).send(simpleSuccessResponse(newData, "Success!"));
  };

  // [GET] /classes/generate-class_code
  generateClassCode = (req, res, next) => {
    res
      .status(200)
      .send(
        simpleSuccessResponse(
          { class_code: generateRandomClassCode(8) },
          "Successfully generated!"
        )
      );
  };

  // [DELETE] /classes/:id/out
  outOfClass = async (req, res, next) => {
    var id = req.params.id;

    var user = req.user;
    if (!id) {
      return res.status(400).send(errorBadRequest("Invalid request"));
    }

    let _class = await classStore.findClassById(id);

    if (_class.owner == user.userId) {
      return res
        .status(400)
        .send(
          errorCustom(
            400,
            "You can't out the class, because you are the owner of class!"
          )
        );
    }

    classRegistrationStore.deleteRegistration(id, user.userId);
    res
      .status(200)
      .send(simpleSuccessResponse(null, "Successfully out of class!"));
  };
}

module.exports = new ClassController();
