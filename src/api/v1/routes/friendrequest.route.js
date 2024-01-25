const express = require("express");
const FriendRequestController = require("../controllers/friendrequest.controller");
const errorHandler = require("../../../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FriendRequests
 */

/**
 * @swagger
 * /friend-requests/requests:
 *   get:
 *     tags: [FriendRequests]
 *     summary: Get friend requests
 *     description: Get friend requests
 *     responses:
 *       200:
 *         description: Friend requests retrieved successfully
 */
router.get(
  "/requests",
  errorHandler(FriendRequestController.getFriendRequests)
);

/**
 * @swagger
 * /friend-requests/check-status/{receiverId}:
 *   get:
 *     tags: [FriendRequests]
 *     summary: Check friend request status by receiver ID
 *     description: Check friend request status by receiver ID
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         description: ID of the friend request receiver
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request status checked successfully
 */
router.get(
  "/check-status/:receiverId",
  errorHandler(FriendRequestController.checkFriendStatus)
);

module.exports = router;
