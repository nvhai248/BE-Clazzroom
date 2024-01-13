const {
  RunCreateCmtAndNotificationAfterTeacherMakeFinalDecision,
} = require("./jobs/job_after_teacher_make_final_decision");
const {
  RunCreateCommentAndUpdateCurrentGradeInReview,
} = require("./jobs/job_after_teacher_update_grade");
const {
  RunCreateNotificationsAfterTeacherFinalizedGradeComposition,
} = require("./jobs/job_create_notification_after_finalized_grade_composition");
const {
  RunCreateNotificationsAfterUserAddComment,
} = require("./jobs/job_create_notification_after_user_add_cmt");
const {
  RunCreateNotificationAfterUserCreateReview,
} = require("./jobs/job_create_notification_after_user_create_review");
const { subscribeToMessages } = require("./subscriber");

// message data
// { topic: 'test', message: { data: 'OK!' } }

function startSubscribers() {
  // Start the subscribers for different topics
  subscribeToMessages("test", (message) => {
    console.log(message);
  });

  subscribeToMessages(
    "TeacherUpdateGrade",
    RunCreateCommentAndUpdateCurrentGradeInReview
  );

  subscribeToMessages(
    "TeacherFinalizedGrade",
    RunCreateNotificationsAfterTeacherFinalizedGradeComposition
  );

  subscribeToMessages(
    "TeacherMakeFinalDecision",
    RunCreateCmtAndNotificationAfterTeacherMakeFinalDecision
  );

  subscribeToMessages(
    "UserAddComment",
    RunCreateNotificationsAfterUserAddComment
  );

  subscribeToMessages(
    "StudentCreateReview",
    RunCreateNotificationAfterUserCreateReview
  );
}

module.exports = { startSubscribers };
