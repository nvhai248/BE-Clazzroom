const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const gradeReviewStore = require("../storages/gradeReview.store");
const userStore = require("../storages/user.store");
const {
  errNoPermission,
  errorBadRequest,
  errorCustom,
  errorNotFound,
  errorUnauthorized,
  errorInternalServer,
} = require("../views/error");

function RequireRoleStudent(req, res, next) {
  try {
    const user = req.user;

    if (user.role != "student") {
      return res.status(403).send(errNoPermission("You are not a student!"));
    }

    next();
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

function RequireRoleTeacher(req, res, next) {
  try {
    const user = req.user;

    if (user.role != "teacher") {
      return res.status(403).send(errNoPermission("You are not a teacher!"));
    }

    next();
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

function RequireRoleAdmin(req, res, next) {
  try {
    const user = req.user;

    if (user.role != "admin") {
      return res.status(403).send(errNoPermission("You are not a admin!"));
    }

    next();
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

async function RequireHavePermissionInReview(req, res, next) {
  try {
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

    if (!review) {
      return res.status(404).send(errorNotFound("Review"));
    }

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
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

async function RequireNotBanned(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await userStore.findUserById(userId);

    if (!user) {
      return res.status(401).send(errorUnauthorized());
    }

    if (user.status == false) {
      return res.status(403).send(errNoPermission("You are banned!"));
    }

    next();
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

async function RequireInClass(req, res, next) {
  try {
    const userId = req.user.userId;
    const classId = req.params.id;

    if (!classId) {
      return res.status(400).send(errorBadRequest("Invalid id!"));
    }

    var isIn = await classStore.findClassById(classId);

    if (!isIn) {
      return res.status(404).send(errorNotFound("Class!"));
    }

    var isJoin = await classRegistrationStore.findByClassIdAndUserId(
      classId,
      userId
    );

    if (!isJoin) {
      return res.status(403).send(errNoPermission("You are not in a class!"));
    }

    next();
  } catch (error) {
    res.status(500).send(errorInternalServer("Internal Server!"));
  }
}

module.exports = {
  RequireRoleStudent,
  RequireRoleTeacher,
  RequireInClass,
  RequireHavePermissionInReview,
  RequireRoleAdmin,
  RequireNotBanned,
};
