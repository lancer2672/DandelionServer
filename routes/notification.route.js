const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const NotificationController = require("../controllers/notification.controller");

const router = express.Router();

router.post(
  "/sendNotification",
  verifyToken,
  NotificationController.sendNotification
);

module.exports = router;
