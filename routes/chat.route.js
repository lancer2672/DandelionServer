const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/verifyToken");
const { body } = require("express-validator");

router.get("/channels", verifyToken, ChatController.getChannels);
router.get("/member/:channelId", verifyToken, ChatController.GetChannelMember);
router.get(
  "/last-message/:channelId",
  verifyToken,
  ChatController.getLastMessage
);
router.get(
  "/messages/:channelId",
  verifyToken,
  ChatController.getChannelMessages
);
router.post(
  "/channel/findOrCreate",
  body("memberIds").exists().withMessage("MemberIds is missing"),
  verifyToken,
  ChatController.findOrCreateChannel
);
module.exports = router;
