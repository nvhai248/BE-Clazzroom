const express = require(`express`);
const router = express.Router();

const classRouter = require("../app/controllers/class.controller");

router.get("/", classRouter.test);

module.exports = router;
