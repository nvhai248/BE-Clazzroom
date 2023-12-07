const { errorInternalServer, errNoPermission } = require("../views/error");

function RequireRoleStudent(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(500).send(errorInternalServer("The session invalid!"));
  }

  if (user.role != "student") {
    return res.status(403).send(errNoPermission("You are not a student!"));
  }

  next();
}

function RequireRoleTeacher(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(500).send(errorInternalServer("The session invalid!"));
  }

  if (user.role != "teacher") {
    return res.status(403).send(errNoPermission("You are not a teacher!"));
  }

  next();
}

module.exports = { RequireRoleStudent, RequireRoleTeacher };
