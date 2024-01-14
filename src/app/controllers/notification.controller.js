const notificationStore = require("../storages/notification.store");
const { errorBadRequest, errorInternalServer } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class NotificationController {
  // [GET] notifications?page=1
  getNotifications = async (req, res) => {
    try {
      const userId = req.user.userId;

      const page = req.query.page || 1;

      const result = await notificationStore.getListByCondition(
        userId,
        page,
        10
      );

      res.status(200).send(simpleSuccessResponse(result, "Successfully!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };

  // [PATCH] /notifications/:id
  editState = async (req, res) => {
    try {
      const data = req.body;
      const id = req.params.id;

      if (!id || !data) {
        res.status(400).send(errorBadRequest("Invalid request!"));
      }

      notificationStore.update(id, data);
      res.status(200).send(simpleSuccessResponse(data, "Successfully!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };
}

module.exports = new NotificationController();
