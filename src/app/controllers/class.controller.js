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
  errorInternalServer,
} = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");
const gradeCompositionStore = require("../storages/gradeComposition.store");
const { default: mongoose } = require("mongoose");
const studentStore = require("../storages/student.store");
const gradeStore = require("../storages/grade.store");

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

        if (!teacherInfo) continue;

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

        if (!studentInfo) continue;

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

  //[GET] /api/classes/:id/grades
  getGradeCompositions = async (req, res) => {
    const classId = req.params.id;

    const gradeCompos =
      await gradeCompositionStore.findGradeCompositionsByClassId(classId);
    res.status(200).send(simpleSuccessResponse(gradeCompos, "Success!"));
  };

  // [PUT] /api/classes/:id/grades
  updateGradeCompositions = async (req, res) => {
    const classId = req.params.id;
    const gradeCompositions = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < gradeCompositions.length; i++) {
        gradeCompositions[i].class_id = classId;

        if (!gradeCompositions[i]._id) {
          if (!gradeCompositions[i].state) {
            gradeCompositions[i].state = "In-progress";
          }
          await gradeCompositionStore.createGradeCompositionWithSession(
            gradeCompositions[i],
            session
          );
        } else {
          await gradeCompositionStore.updateGradeCompositionWithSession(
            gradeCompositions[i]._id,
            gradeCompositions[i],
            session
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .send(simpleSuccessResponse(gradeCompositions, "Success!"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res
        .status(500)
        .send(
          errorInternalServer(
            "Error occurred. Rollback performed. Or one name of grade compositions existed!"
          )
        );
    }
  };

  //[DELETE] /api/classes/:id/grades
  deleteGradeCompositions = async (req, res) => {
    const gradesCompoIds = req.body;
    for (let i = 0; i < gradesCompoIds.length; i++) {
      await gradeCompositionStore.deleteGradeComposition(gradesCompoIds[i]._id);
    }

    res.status(200).send(simpleSuccessResponse(null, "Success deleted!"));
  };

  // [GET] /api/classes/:id/student-list
  getStudentList = async (req, res) => {
    const classId = req.params.id;

    var students = await studentStore.findStudentsByClassId(classId);

    for (var i = 0; i < students.length; i++) {
      students[i].grades = await gradeStore.findGradesByStudentIdAndClassId(
        students[i].student_id,
        classId
      );
    }

    res
      .status(200)
      .send(simpleSuccessResponse(students, "Successfully found students!"));
  };

  // [POST] /api/classes/:id/student-list
  createListStudent = async (req, res) => {
    const classId = req.params.id;
    const students = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < students.length; i++) {
        students[i].class_id = classId;
        await studentStore.createOrUpdate(students[i], session);
      }

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .send(simpleSuccessResponse(null, "Success create list student!"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res
        .status(500)
        .send(
          errorInternalServer(
            "Error occurred. Rollback performed. Or one student Id is existed!"
          )
        );
    }
  };

  // [DELETE] /api/classes/:id/student-list
  deleteStudents = async (req, res) => {
    const classId = req.params.id;
    const studentIds = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < studentIds.length; i++) {
        try {
          await studentStore.deleteStudentByStudentIdAndClassId(
            studentIds[i].student_id,
            classId,
            session
          );
        } catch (error) {
          console.log(
            `Error deleting student ${studentIds[i].student_id}: ${error.message}`
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .send(simpleSuccessResponse(null, "Success delete students!"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(500).send(errorInternalServer("Cannot delete students"));
    }
  };

  // [PUT] /api/classes/:id/student-list/:student_id
  addGradesToStudentInAClass = async (req, res) => {
    const classId = req.params.id;
    const grades = req.body;
    const studentId = req.params.student_id;

    if (!studentId) {
      return res.status(404).send(errorBadRequest("Student Id is required!"));
    }

    const student = await studentStore.findStudentByStudentIdAndClassId(
      studentId,
      classId
    );

    if (!student) {
      return res.status(404).send(errorBadRequest("Can not find student!"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < grades.length; i++) {
        const gradeCompositionExists =
          await gradeCompositionStore.findGradeCompositionById(
            grades[i].grade_composition_id
          );

        if (!gradeCompositionExists) {
          continue;
        }

        await gradeStore.createOrUpdateGrade(
          {
            value: grades[i].value,
            grade_composition_id: grades[i].grade_composition_id,
            student_id: studentId,
            class_id: classId,
          },
          session
        );
      }

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .send(simpleSuccessResponse(null, "Success adding grades to student!"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res
        .status(500)
        .send(errorInternalServer("Error occurred. Rollback performed!"));
    }
  };
}

module.exports = new ClassController();
