const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/verifyToken");
const { body } = require("express-validator");
const errorHandler = require("../middleware/errorHandler");

/**
 * @swagger
 * tags:
 *   name: Chat
 */

/**
 * @swagger
 * /chat/channels:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat channels
 *     description: Get chat channels
 *     responses:
 *       200:
 *         description: Chat channels retrieved successfully
 */
router.get("/channels", verifyToken, errorHandler(ChatController.getChannels));

/**
 * @swagger
 * /chat/member/{channelId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get channel members by channel ID
 *     description: Get channel members by channel ID
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: ID of the chat channel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel members retrieved successfully
 */
router.get(
  "/member/:channelId",
  verifyToken,
  errorHandler(ChatController.GetChannelMember)
);

/**
 * @swagger
 * /chat/last-message/{channelId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get last message in a channel by channel ID
 *     description: Get last message in a channel by channel ID
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: ID of the chat channel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Last message retrieved successfully
 */
router.get(
  "/last-message/:channelId",
  verifyToken,
  errorHandler(ChatController.getLastMessage)
);

/**
 * @swagger
 * /chat/messages/{channelId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a channel by channel ID
 *     description: Get messages in a channel by channel ID
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: ID of the chat channel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get(
  "/messages/:channelId",
  verifyToken,
  errorHandler(ChatController.getChannelMessages)
);

/**
 * @swagger
 * /chat/channel/find:
 *   post:
 *     tags: [Chat]
 *     summary: Find or create a chat channel
 *     description: Find or create a chat channel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               memberIds: ["userId1", "userId2"]
 *     responses:
 *       200:
 *         description: Channel found or created successfully
 */
router.post(
  "/channel/find",
  body("memberIds").exists().withMessage("MemberIds is missing"),
  verifyToken,
  errorHandler(ChatController.findOrCreateChannel)
);

module.exports = router;
