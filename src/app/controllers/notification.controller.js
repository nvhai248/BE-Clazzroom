const notificationStore = require("../storages/notification.store");
const { errorBadRequest } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class NotificationController {
  // [GET] notifications?page=1
  getNotifications = async (req, res) => {
    const userId = req.user.userId;

    const page = req.query.page || 1;

    const result = await notificationStore.getListByCondition(userId, page, 10);

    res.status(200).send(simpleSuccessResponse(result, "Successfully!"));
  };

  // [PATCH] /notifications/:id
  editState = async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    if (!id || !data) {
      res.status(400).send(errorBadRequest("Invalid request!"));
    }

    notificationStore.update(id, data);
    res.status(200).send(simpleSuccessResponse(data, "Successfully!"));
  };
}

module.exports = new NotificationController();
