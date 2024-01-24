const express = require("express");
const NotificationController = require("../controllers/notification.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications
 *     description: Get all notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get(
  "/",
  errorHandler(NotificationController.getAllNotifications)
);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification by ID
 *     description: Delete a notification by ID
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         description: ID of the notification to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
router.delete(
  "/:notificationId",
  errorHandler(NotificationController.deleteNotification)
);

module.exports = router;
