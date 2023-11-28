const express = require(`express`);
const router = express.Router();

const imageRouter = require("../app/controllers/image.controller");
const uploadImage = require("../app/middlewares/uploadImage");
const authenticate = require("../app/middlewares/authenticate");

router.post("/image",authenticate , uploadImage, imageRouter.uploadImage);

module.exports = router;
