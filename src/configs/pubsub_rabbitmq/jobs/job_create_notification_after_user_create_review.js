const classRegistrationStore = require("../../../app/storages/classRegistration.store");
const classStore = require("../../../app/storages/class.store");
const gradeCompositionStore = require("../../../app/storages/gradeComposition.store");
const notificationStore = require("../../../app/storages/notification.store");
const userStore = require("../../../app/storages/user.store");

const RunCreateNotificationAfterUserCreateReview = async (message) => {
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

  // get registrations
  const registrations =
    await classRegistrationStore.findClassRegistrationsByClassIdAndRole(
      message.message.class_id,
      "teacher"
    );

  if (!registrations) return;
  for (let i = 0; i < registrations.length; i++) {
    notificationStore.create({
      content: `${user.full_name} requested a grade review on ${gradeComposition.name}`,
      state: "new",
      class: `${myClass.class_name}`,
      url: `/review/${message.message._id}`,
      to_user: `${registrations[i].user_id}`,
    });
  }
};

module.exports = { RunCreateNotificationAfterUserCreateReview };
