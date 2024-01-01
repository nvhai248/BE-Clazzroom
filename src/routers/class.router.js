const express = require(`express`);
const router = express.Router();

const classRouter = require("../app/controllers/class.controller");
const authenticate = require("../app/middlewares/authenticate");
const {
  RequireRoleTeacher,
  RequireInClass,
} = require("../app/middlewares/require");

// grade ab=ng student list router
router.get(
  "/:id/student-list",
  authenticate,
  RequireInClass,
  classRouter.getStudentList
);

//grade composition routers
router.get(
  "/:id/grades",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.getGradeCompositions
);

router.put(
  "/:id/grades",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.updateGradeCompositions
);

router.delete(
  "/:id/grades",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.deleteGradeCompositions
);

// class routers
router.delete("/:id/out", authenticate, RequireInClass, classRouter.outOfClass);
router.get("/generate-class_code", classRouter.generateClassCode);
router.get("/", authenticate, classRouter.getListClasses);
router.patch("/:id", authenticate, classRouter.editClassProfile);
router.post(
  "/:id/request-send-invitation",
  authenticate,
  RequireInClass,
  classRouter.requestSendInvitation
);
router.post("/join", authenticate, classRouter.joinClass);
router.get("/:id", authenticate, RequireInClass, classRouter.findClass);
router.post("/", authenticate, RequireRoleTeacher, classRouter.createNewClass);

module.exports = router;
