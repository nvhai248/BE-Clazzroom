const express = require(`express`);
const router = express.Router();

const classRouter = require("../app/controllers/class.controller");
const authenticate = require("../app/middlewares/authenticate");
const {
  RequireRoleTeacher,
  RequireInClass,
  RequireRoleAdmin,
  RequireNotBanned,
} = require("../app/middlewares/require");

router.get(
  "/:id/student-list/mapped-account/:student_id",
  authenticate,
  RequireInClass,
  classRouter.getAccountMappedByStudentId
);

router.get(
  "/:id/student-list/mapped-account",
  authenticate,
  RequireInClass,
  classRouter.getAccountsMappedByStudentIds
);

// grade ab=ng student list router
router.put(
  "/:id/grades/upload",
  authenticate,
  RequireRoleTeacher,
  RequireInClass,
  classRouter.UploadGradesOfGradeComposition
);

router.get(
  "/:id/student-list",
  authenticate,
  RequireInClass,
  classRouter.getStudentList
);

router.post(
  "/:id/student-list",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.createListStudent
);

router.delete(
  "/:id/student-list",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.deleteStudents
);

router.put(
  "/:id/student-list/:student_object_id",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.addGradesAndChangeStudentInfoToStudentInAClass
);

//grade composition routers
router.patch(
  "/:id/grade-compositions/:grade_composition_id/finalized",
  authenticate,
  RequireRoleTeacher,
  RequireInClass,
  classRouter.finalizedGradeCompositions
);

router.get(
  "/:id/grades",
  authenticate,
  RequireInClass,
  classRouter.getGradeCompositions
);

router.put(
  "/:id/grades",
  authenticate,
  RequireInClass,
  RequireRoleTeacher,
  classRouter.updateGradeCompositions
);

router.post(
  "/:id/grades/delete",
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

// admin
router.get(
  "/admin/allClass",
  authenticate,
  RequireRoleAdmin,
  RequireNotBanned,
  classRouter.getAllClasses
);
module.exports = router;
