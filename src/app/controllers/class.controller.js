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
  errorNotFound,
} = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");
const gradeCompositionStore = require("../storages/gradeComposition.store");
const { default: mongoose } = require("mongoose");
const studentStore = require("../storages/student.store");
const gradeStore = require("../storages/grade.store");
const gradeReviewStore = require("../storages/gradeReview.store");
const commentStore = require("../storages/comment.store");
const { publishMessage } = require("../../configs/pubsub_rabbitmq/publisher");

class ClassController {
  //[GET] /classes
  getListClasses = async (req, res) => {
    try {
      var user = req.user;

      let registrations = await classRegistrationStore.findListClassIdByUserId(
        user.userId
      );

      let result = [];
      for (var i = 0; i < registrations.length; i++) {
        var _class = await classStore.findClassById(registrations[i].class_id);
        if (!_class) continue;
        var owner = await userStore.findUserById(_class.owner);
        if (!owner) continue;
        delete owner.password;
        _class.owner = owner;
        result.push(_class);
      }

      res.status(200).send(simpleSuccessResponse(result, "Success!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  //[POST] /classes/
  createNewClass = async (req, res) => {
    try {
      var data = req.body;

      if (!data) {
        return res.status(400).send(errorBadRequest("Invalid request!"));
      }

      // set default class
      data.owner = req.user.userId;
      data.status = "active";
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [GET] /classes/:id
  findClass = async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [POST] /classes/join
  joinClass = async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [POST] /classes/:id/request-send-invitation
  requestSendInvitation = async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PATCH] /classes/:id
  editClassProfile = async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
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
    try {
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
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  //[GET] /api/classes/:id/grades
  getGradeCompositions = async (req, res) => {
    try {
      const classId = req.params.id;

      const gradeCompos =
        await gradeCompositionStore.findGradeCompositionsByClassId(classId);
      res.status(200).send(simpleSuccessResponse(gradeCompos, "Success!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PUT] /api/classes/:id/grades
  updateGradeCompositions = async (req, res) => {
    try {
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

            delete gradeCompositions[i]._id;

            gradeCompositions[i] =
              await gradeCompositionStore.createGradeCompositionWithSession(
                gradeCompositions[i],
                session
              );
            gradeCompositions[i] = gradeCompositions[i][0];
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
          .status(400)
          .send(
            errorBadRequest(
              "Error occurred. Rollback performed. Or one name of grade compositions existed!"
            )
          );
      }
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  //[DELETE] /api/classes/:id/grades
  deleteGradeCompositions = async (req, res) => {
    try {
      const gradesCompoIds = req.body;
      for (let i = 0; i < gradesCompoIds.length; i++) {
        await gradeCompositionStore.deleteGradeComposition(
          gradesCompoIds[i].grade_composition_id
        );
      }

      res.status(200).send(simpleSuccessResponse(null, "Success deleted!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [GET] /api/classes/:id/student-list
  getStudentList = async (req, res) => {
    const classId = req.params.id;

    try {
      const students = await studentStore.findStudentsByClassId(classId);
      const gradeCompositions =
        await gradeCompositionStore.findGradeCompositionsByClassId(classId);

      for (let i = 0; i < students.length; i++) {
        const studentGrades = await gradeStore.findGradesByStudentIdAndClassId(
          students[i].student_id,
          classId
        );

        const studentGradesMap = new Map(
          studentGrades.map((grade) => [grade.grade_composition_id, grade])
        );

        var mergedGrades = [];
        for (let i = 0; i < gradeCompositions.length; i++) {
          if (studentGradesMap.get(gradeCompositions[i]._id.toString())) {
            mergedGrades.push({
              grade_composition_id: gradeCompositions[i]._id,
              value: studentGradesMap.get(gradeCompositions[i]._id.toString())
                .value,
            });
          } else {
            mergedGrades.push({
              grade_composition_id: gradeCompositions[i]._id,
              value: null,
            });
          }
        }

        students[i].grades = mergedGrades;
      }

      res
        .status(200)
        .send(simpleSuccessResponse(students, "Successfully found students!"));
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(simpleErrorResponse("Internal Server Error"));
    }
  };

  // [POST] /api/classes/:id/student-list
  createListStudent = async (req, res) => {
    try {
      const classId = req.params.id;
      const students = req.body;

      console.log(classId);

      studentStore.deleteAllStudentInClass(classId);
      gradeStore.deleteAllByClassId(classId);
      gradeReviewStore.deleteAllByClassId(classId);

      for (let i = 0; i < students.length; i++) {
        students[i].class_id = classId;
        students[i] = await studentStore.createOrUpdate(students[i]);
      }

      res
        .status(200)
        .send(simpleSuccessResponse(students, "Success create list student!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
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

      res.status(400).send(errorBadRequest("Cannot delete students"));
    }
  };

  // [PUT] /api/classes/:id/student-list/:student_object_id
  addGradesAndChangeStudentInfoToStudentInAClass = async (req, res) => {
    const classId = req.params.id;
    const studentId = req.body.student_id;
    const studentName = req.body.full_name;
    const grades = req.body.grades;
    const id = req.params.student_object_id; // it's not student.student_id. It's student._id

    if (!id) {
      return res.status(404).send(errorBadRequest("Student Id is required!"));
    }

    const student = await studentStore.findStudentById(id);

    if (!student) {
      return res.status(400).send(errorBadRequest("Can not find student!"));
    }

    if (student.class_id != classId) {
      return res.status(400).send(errorBadRequest("Student not in class!"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await studentStore.updateStudentInfoById(
        id,
        { student_id: studentId, full_name: studentName },
        session
      );

      if (studentId != student.student_id) {
        gradeStore.deleteAllByStudentIdAndClassId(student.student_id, classId);
      }

      for (let i = 0; i < grades.length; i++) {
        const gradeCompositionExists =
          await gradeCompositionStore.findGradeCompositionByIdAndClassId(
            grades[i].grade_composition_id,
            classId
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

        let review =
          await gradeReviewStore.getReviewByClassIdStudentIdAndGradeCompId(
            studentId,
            grades[i].grade_composition_id,
            classId
          );

        if (review && review.current_grade != grades[i].value) {
          publishMessage("TeacherUpdateGrade", {
            new_grade: grades[i].value,
            review_id: review._id,
          });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).send(
        simpleSuccessResponse(
          {
            _id: id,
            student_id: studentId,
            full_name: studentName,
            grades: grades,
          },
          "Success adding grades to student!"
        )
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(400).send(errorBadRequest("Can't update grades!"));
    }
  };

  // {GET} /api/classes/admin/allClass
  getAllClasses = async (req, res) => {
    try {
      const classes = await classStore.getAllClass();

      for (let i = 0; i < classes.length; i++) {
        var owner = await userStore.findUserById(classes[i].owner);
        if (!owner) continue;

        delete owner.password;
        classes[i].owner = owner;
      }

      res.status(200).send(simpleSuccessResponse(classes, "Successfully !"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PATCH] /api/classes/:id/grade-compositions/:grade_composition_id/finalized
  finalizedGradeCompositions = async (req, res) => {
    try {
      const grade_composition_id = req.params.grade_composition_id;
      const class_id = req.params.id;
      if (!grade_composition_id) {
        return res
          .status(400)
          .send(errorBadRequest("Invalid grade composition id!"));
      }
      var gradeComposition =
        await gradeCompositionStore.findGradeCompositionById(
          grade_composition_id
        );

      if (!gradeComposition) {
        return res
          .status(404)
          .send(errorNotFound("grade composition not found!"));
      }

      if (gradeComposition.state == "Finalized") {
        return res
          .status(400)
          .send(errorCustom("grade composition already finalized!"));
      }

      await gradeCompositionStore.updateGradeCompositionWithSession(
        grade_composition_id,
        {
          state: "Finalized",
        },
        null
      );

      publishMessage("TeacherFinalizedGrade", {
        class_id: class_id,
        grade_composition_id: grade_composition_id,
        grade_composition_name: gradeComposition.name,
      });

      res
        .status(200)
        .send(
          simpleSuccessResponse(
            { state: "Finalized" },
            "Success finalized grade composition!"
          )
        );
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [GET] /api/classes/:id/student-list/mapped-account
  getAccountsMappedByStudentIds = async (req, res) => {
    try {
      const id = req.params.id;

      const students = await studentStore.findStudentsByClassId(id);

      let result = [];

      for (let i = 0; i < students.length; i++) {
        var user = await userStore.findUserByStudentId(students[i].student_id);
        if (!user) continue;
        delete user.password;
        result.push(user);
      }

      if (!result) {
        return res.status(404).send(errorNotFound("Can't find students!"));
      }

      res.status(200).send(simpleSuccessResponse(result, "Success!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [GET] /api/classes/:id/student-list/mapped-account/:student_id
  getAccountMappedByStudentId = async (req, res) => {
    try {
      const student_id = req.params.student_id;

      let result = await userStore.findUserByStudentId(student_id);

      if (!result) {
        return res.status(404).send(errorNotFound("Can't find student!"));
      }

      delete result.password;

      res.status(200).send(simpleSuccessResponse(result, "Success!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PUT]  /classes/:id/grades/upload
  UploadGradesOfGradeComposition = async (req, res) => {
    const classId = req.params.id;
    const gradeCompositionId = req.body.grade_composition_id;
    const grades = req.body.data;

    const isGradeCompositionInClass =
      await gradeCompositionStore.findGradeCompositionById(gradeCompositionId);

    if (
      !isGradeCompositionInClass ||
      !isGradeCompositionInClass.class_id == classId
    ) {
      return res
        .status(404)
        .send(errorCustom(404, "Couldn't find grade composition!"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < grades.length; i++) {
        await gradeStore.createOrUpdateGrade(
          {
            value: grades[i].value,
            grade_composition_id: gradeCompositionId,
            student_id: grades[i].student_id,
            class_id: classId,
          },
          session
        );

        let review =
          await gradeReviewStore.getReviewByClassIdStudentIdAndGradeCompId(
            grades[i].student_id,
            gradeCompositionId,
            classId
          );

        if (review && review.current_grade != grades[i].value) {
          publishMessage("TeacherUpdateGrade", {
            new_grade: grades[i].value,
            review_id: review._id,
          });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .send(
          simpleSuccessResponse(
            grades,
            "Success adding grades to student in a grade composition!"
          )
        );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(400).send(errorBadRequest("Can't update grades!"));
    }
  };

  // [PATCH] /classes/:id/active
  ActiveClass = async (req, res) => {
    try {
      const classId = req.params.id;

      if (!classId) {
        return res.status(400).send(errorBadRequest("Invalid class id!"));
      }

      const myClass = await classStore.findClassById(classId);

      if (!myClass) {
        return res.status(404).send(errorNotFound("Class!"));
      }

      if (myClass.status == "active") {
        return res.status(400).send(errorBadRequest("Class already active!"));
      }

      await classStore.updateClass(classId, { status: "active" });
      res
        .status(200)
        .send(simpleSuccessResponse(null, "Success active class!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PATCH] /classes/:id/inactive
  InactiveClass = async (req, res) => {
    try {
      const classId = req.params.id;

      if (!classId) {
        return res.status(400).send(errorBadRequest("Invalid class id!"));
      }

      const myClass = await classStore.findClassById(classId);

      if (!myClass) {
        return res.status(404).send(errorNotFound("Class!"));
      }

      if (myClass.status == "inactive") {
        return res.status(400).send(errorBadRequest("Class already inactive!"));
      }

      await classStore.updateClass(classId, { status: "inactive" });
      res
        .status(200)
        .send(simpleSuccessResponse(null, "Success inactive class!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [GET] /classes/:id/grade-board
  getGradeBoardInAClass = async (req, res) => {
    try {
      const userId = req.user.userId;
      const classId = req.params.id;

      const user = await userStore.findUserById(userId);

      if (!user) return res.status(404).send(errorNotFound("User!"));
      if (!user.student_id)
        return res
          .status(400)
          .send(errorCustom(400, "You need update your student id!"));

      var gradeCompositions =
        await gradeCompositionStore.findGradeCompositionsByClassId(classId);

      var result = [];
      for (let i = 0; i < gradeCompositions.length; i++) {
        if (gradeCompositions[i].state != "Finalized") continue;

        let isReviewed = true;

        var grade =
          await gradeStore.findGradeByStudentIdAndClassIdAndGradeCompositionId(
            user.student_id,
            classId,
            gradeCompositions[i]._id
          );

        console.log(grade);

        if (
          !(await gradeReviewStore.getReviewByClassIdStudentIdAndGradeCompId(
            user.student_id,
            gradeCompositions[i]._id,
            classId
          ))
        ) {
          isReviewed = false;
        }

        if (!grade) {
          result.push({
            _id: gradeCompositions[i]._id,
            name: gradeCompositions[i].name,
            scale: gradeCompositions[i].scale,
            is_reviewed: isReviewed,
            value: null,
          });
        } else {
          result.push({
            _id: gradeCompositions[i]._id,
            name: gradeCompositions[i].name,
            scale: gradeCompositions[i].scale,
            value: grade.value,
            is_reviewed: isReviewed,
          });
        }
      }

      res.status(200).send(simpleSuccessResponse(result, "Success!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };
}

module.exports = new ClassController();
