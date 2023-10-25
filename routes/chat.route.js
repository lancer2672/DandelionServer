const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/verifyToken");
const { body } = require("express-validator");
const errorHandler = require("../middleware/errorHandler");

router.get("/channels", verifyToken, errorHandler(ChatController.getChannels));
router.get(
  "/member/:channelId",
  verifyToken,
  errorHandler(ChatController.GetChannelMember)
);
router.get(
  "/last-message/:channelId",
  verifyToken,
  errorHandler(ChatController.getLastMessage)
);
router.get(
  "/messages/:channelId",
  verifyToken,
  errorHandler(ChatController.getChannelMessages)
);
router.post(
  "/channel/findOrCreate",
  body("memberIds").exists().withMessage("MemberIds is missing"),
  verifyToken,
  errorHandler(ChatController.findOrCreateChannel)
);
module.exports = router;
