const express = require(`express`);
const router = express.Router();

const reviewRouter = require("../app/controllers/review.controller");
const authenticate = require("../app/middlewares/authenticate");
const {
  RequireRoleTeacher,
  RequireRoleStudent,
  RequireHavePermissionInReview,
} = require("../app/middlewares/require");

router.get("/", authenticate, reviewRouter.getListReview);
router.get(
  "/:id",
  authenticate,
  RequireHavePermissionInReview,
  reviewRouter.getReviewDetail
);
router.post("/", authenticate, RequireRoleStudent, reviewRouter.createReview);
router.get(
  "/:id/comments",
  authenticate,
  RequireHavePermissionInReview,
  reviewRouter.getListComments
);
router.post(
  "/:id/final-decision",
  authenticate,
  RequireRoleTeacher,
  reviewRouter.makeFinalDecision
);
router.post(
  "/:id/comments",
  authenticate,
  RequireHavePermissionInReview,
  reviewRouter.addCmt
);
module.exports = router;
