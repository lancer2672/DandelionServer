const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const NotificationController = require("../controllers/notification.controller");

const router = express.Router();

router.post(
  "/send-notification",
  verifyToken,
  NotificationController.sendNotification
);

router.get("/", verifyToken, NotificationController.getAllNotifications);
module.exports = router;
