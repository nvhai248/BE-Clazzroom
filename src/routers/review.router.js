const express = require(`express`);
const router = express.Router();

const reviewRouter = require("../app/controllers/review.controller");
const authenticate = require("../app/middlewares/authenticate");
const { RequireRoleTeacher } = require("../app/middlewares/require");

router.get("/", authenticate, RequireRoleTeacher, reviewRouter.getListReview);
router.get(
  "/:id",
  authenticate,
  RequireRoleTeacher,
  reviewRouter.getReviewDetail
);
router.post("/", authenticate, reviewRouter.createReview);
router.get("/:id/comments", authenticate, reviewRouter.getListComments);
module.exports = router;
