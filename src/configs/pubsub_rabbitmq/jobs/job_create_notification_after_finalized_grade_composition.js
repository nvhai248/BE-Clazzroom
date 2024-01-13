const classStore = require("../../../app/storages/class.store");
const classRegistrationStore = require("../../../app/storages/classRegistration.store");
const notificationStore = require("../../../app/storages/notification.store");

const RunCreateNotificationsAfterTeacherFinalizedGradeComposition = async (
  message
) => {
  // get class name
  const myClass = await classStore.findClassById(message.message.class_id);

  if (!myClass || !myClass.class_name) return;

  // get registrations
  const registrations =
    await classRegistrationStore.findClassRegistrationsByClassIdAndRole(
      message.message.class_id,
      "student"
    );

  if (!registrations) return;

  for (let i = 0; i < registrations.length; i++) {
    notificationStore.create({
      content: `${message.message.grade_composition_name} is finalized`,
      state: "new",
      class: `${myClass.class_name}`,
      url: `/class/${message.message.class_id}/grade`,
      to_user: `${registrations[i].user_id}`,
    });
  }
};

module.exports = {
  RunCreateNotificationsAfterTeacherFinalizedGradeComposition,
};
