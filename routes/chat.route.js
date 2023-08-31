const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/verifyToken");

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
module.exports = router;
