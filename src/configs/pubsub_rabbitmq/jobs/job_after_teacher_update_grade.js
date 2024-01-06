const commentStore = require("../../../app/storages/comment.store");
const gradeReviewStore = require("../../../app/storages/gradeReview.store");

const RunCreateCommentAndUpdateCurrentGradeInReview = (message) => {
  commentStore.createNewComment({
    type: "updating",
    new_grade: message.message.new_grade,
    review_id: message.message.review_id,
  });

  gradeReviewStore.updateReviewDataById(message.message.review_id, {
    current_grade: message.message.new_grade,
  });
};

module.exports = { RunCreateCommentAndUpdateCurrentGradeInReview };
