const classStore = require("../../../app/storages/class.store");
const commentStore = require("../../../app/storages/comment.store");
const gradeCompositionStore = require("../../../app/storages/gradeComposition.store");
const notificationStore = require("../../../app/storages/notification.store");
const userStore = require("../../../app/storages/user.store");

const RunCreateCmtAndNotificationAfterTeacherMakeFinalDecision = async (
  message
) => {
  commentStore.createNewComment({
    type: "closing",
    final_grade: message.message.final_grade,
    review_id: message.message.review_id,
  });

  // get user full name
  const user = await userStore.findUserById(message.message.user_id);

  if (!user || !user.full_name) return;

  // get grade composition name
  const gradeComposition = await gradeCompositionStore.findGradeCompositionById(
    message.message.grade_composition_id
  );

  if (!gradeComposition || !gradeComposition.name) return;

  // get class name
  const myClass = await classStore.findClassById(message.message.class_id);

  if (!myClass || !myClass.class_name) return;

  notificationStore.create({
    content: `${user.full_name} made a final decision for the review on ${gradeComposition.name}`,
    state: "new",
    class: `${myClass.class_name}`,
    url: `/review/${message.message.review_id}`,
    to_user: `${message.message.review_owner}`,
  });
};

module.exports = { RunCreateCmtAndNotificationAfterTeacherMakeFinalDecision };
