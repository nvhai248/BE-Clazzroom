const {
  RunCreateCmtAndNotificationAfterTeacherMakeFinalDecision,
} = require("./jobs/job_after_teacher_make_final_decision");
const {
  RunCreateCommentAndUpdateCurrentGradeInReview,
} = require("./jobs/job_after_teacher_update_grade");
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

  subscribeToMessages("TeacherFinalizedGrade", handleMessage1);

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

function handleMessage1(message) {
  console.log("Handling message for 'TeacherFinalizedGrade':", message);
  // Process message for 'TeacherFinalizedGrade'
}

module.exports = { startSubscribers };
