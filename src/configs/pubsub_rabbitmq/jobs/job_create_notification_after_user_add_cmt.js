const classRegistrationStore = require("../../../app/storages/classRegistration.store");
const gradeReviewStore = require("../../../app/storages/gradeReview.store");
const classStore = require("../../../app/storages/class.store");
const gradeCompositionStore = require("../../../app/storages/gradeComposition.store");
const notificationStore = require("../../../app/storages/notification.store");
const userStore = require("../../../app/storages/user.store");

const RunCreateNotificationsAfterUserAddComment = async (message) => {
  const review = await gradeReviewStore.getReviewById(
    message.message.review_id
  );

  if (!review) return;

  // get user full name
  const user = await userStore.findUserById(message.message.user_id);

  if (!user || !user.full_name) return;

  // get grade composition name
  const gradeComposition = await gradeCompositionStore.findGradeCompositionById(
    review.grade_composition_id
  );

  if (!gradeComposition || !gradeComposition.name) return;

  // get class name
  const myClass = await classStore.findClassById(review.class_id);

  if (!myClass || !myClass.class_name) return;

  // increase comment count
  gradeReviewStore.increaseCommentCountById(message.message.review_id);

  // notifications to review owner
  if (user._id != review.user_id) {
    notificationStore.create({
      content: `${user.full_name} added a new comment to the review on ${gradeComposition.name}`,
      state: "new",
      class: `${myClass.class_name}`,
      url: `/review/${message.message.review_id}`,
      to_user: `${review.user_id}`,
    });
  }

  // get registrations
  let registrations =
    await classRegistrationStore.findClassRegistrationsByClassIdAndRole(
      review.class_id,
      "teacher"
    );

  if (!registrations) return;

  registrations = registrations.filter(r => r.user_id != user._id);

  for (let i = 0; i < registrations.length; i++) {
    notificationStore.create({
      content: `${user.full_name} added a new comment to the review on ${gradeComposition.name}`,
      state: "new",
      class: `${myClass.class_name}`,
      url: `/review/${message.message.review_id}`,
      to_user: `${registrations[i].user_id}`,
    });
  }
};

module.exports = { RunCreateNotificationsAfterUserAddComment };
