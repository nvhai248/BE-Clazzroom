const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const gradeReviewStore = require("../storages/gradeReview.store");
const { errNoPermission, errorBadRequest } = require("../views/error");

function RequireRoleStudent(req, res, next) {
  const user = req.user;

  if (user.role != "student") {
    return res.status(403).send(errNoPermission("You are not a student!"));
  }

  next();
}

function RequireRoleTeacher(req, res, next) {
  const user = req.user;

  if (user.role != "teacher") {
    return res.status(403).send(errNoPermission("You are not a teacher!"));
  }

  next();
}

async function RequireHavePermissionInReview(req, res, next) {
  const id = req.params.id;

  if (!id) {
    return res
      .status(400)
      .send(errorBadRequest("Please provide a valid review id!"));
  }

  const mainUser = req.user;

  const review = await gradeReviewStore.getReviewById(id);
  // check if student => is owner => access else => no access
  // check if teacher => if in class => access else => no access
  if (
    (mainUser.role == "student" && mainUser.userId != review.user_id) ||
    (mainUser.role == "teacher" &&
      !(await classRegistrationStore.findByClassIdAndUserId(
        review.class_id,
        mainUser.userId
      )))
  ) {
    return res
      .status(403)
      .send(errNoPermission("You do not have permission to access!"));
  }

  next();
}

async function RequireInClass(req, res, next) {
  const userId = req.user.userId;
  const classId = req.params.id;

  if (!classId) {
    return res.status(400).send(errorBadRequest("Invalid id!"));
  }

  var isIn = await classStore.findClassById(classId);

  if (!isIn) {
    return res.status(400).send(errorBadRequest("Class not found!"));
  }

  var isJoin = await classRegistrationStore.findByClassIdAndUserId(
    classId,
    userId
  );

  if (!isJoin) {
    return res.status(403).send(errNoPermission("You are not in a class!"));
  }

  next();
}

module.exports = {
  RequireRoleStudent,
  RequireRoleTeacher,
  RequireInClass,
  RequireHavePermissionInReview,
};
