const Notification = require("../models/notification.model");
const mongooseHelper = require("../utils/mongoose.helper");

class notificationStore {
  create = async (data) => {
    Notification.create([data]);
  };

  update = async (id, data) => {
    await Notification.updateOne({ _id: id }, data);
  };

  getListByCondition = async (userId, page, perPage) => {
    // Get notifications with state "new" or "viewed" for the given user ID
    const notifications = await Notification.find({
      to_user: userId,
    })
      .sort({ created_at: -1 }) // Sort by createdAt in descending order (latest to oldest)
      .limit(perPage)
      .skip((page - 1) * perPage);

    // Get the total count of "new" and "viewed" notifications for the user
    const totalNotificationsCount = await Notification.countDocuments({
      to_user: userId,
    });

    // Get the count of "new" notifications
    const newNotificationsCount = await Notification.countDocuments({
      to_user: userId,
      state: "new",
    });

    // Calculate total pages
    const total = Math.ceil(totalNotificationsCount / perPage);

    return {
      total: totalNotificationsCount,
      new: newNotificationsCount, // Add the count of "new" notifications
      per_page: perPage,
      total: total,
      page: page,
      data: mongooseHelper.multiMongooseToObject(notifications),
    };
  };
}

module.exports = new notificationStore();
