const express = require(`express`);
const router = express.Router();

const notificationRouter = require("../app/controllers/notification.controller");
const authenticate = require("../app/middlewares/authenticate");

router.post("/:id", authenticate, notificationRouter.editState);

router.get("/", authenticate, notificationRouter.getNotifications);

module.exports = router;
