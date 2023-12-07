const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const userStore = require("../storages/user.store");
const { generateRandomClassCode } = require("../utils/class.helper");
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

    res.status(200).send(simpleSuccessResponse(myClass, "success!"));
  };
}

module.exports = new ClassController();
