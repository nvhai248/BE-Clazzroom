const express = require(`express`);
const router = express.Router();

const classRouter = require("../app/controllers/class.controller");
const authenticate = require("../app/middlewares/authenticate");
const { RequireRoleTeacher } = require("../app/middlewares/requireRole");

router.get("/", authenticate, RequireRoleTeacher, classRouter.createNewClass);

module.exports = router;
