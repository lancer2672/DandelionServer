const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const NotificationController = require("../controllers/notification.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/send-notification",
  verifyToken,
  errorHandler(NotificationController.sendNotification)
);

router.get(
  "/",
  verifyToken,
  errorHandler(NotificationController.getAllNotifications)
);
router.delete(
  "/:notificationId",
  verifyToken,
  errorHandler(NotificationController.deleteNotification)
);
module.exports = router;
