const express = require("express");
const router = express.Router();
const ChannelController = require("../controllers/channel.controller");
const verifyToken = require("../middleware/veryfyToken");

router.get("/", verifyToken, ChannelController.getChannels);
router.get(
  "/members/:channelId",
  verifyToken,
  ChannelController.GetChannelMember
);
router.get(
  "/messages/:channelId",
  verifyToken,
  ChannelController.getRecentMessages
);
module.exports = router;
