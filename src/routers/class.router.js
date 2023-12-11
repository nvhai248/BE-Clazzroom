const express = require(`express`);
const router = express.Router();

const classRouter = require("../app/controllers/class.controller");
const authenticate = require("../app/middlewares/authenticate");
const {
  RequireRoleTeacher,
  RequireInClass,
} = require("../app/middlewares/require");

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
