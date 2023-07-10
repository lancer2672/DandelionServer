const express = require("express");
const router = express.Router();
const ChannelController = require("../controllers/channel.controller");
const verifyToken = require("../middleware/veryfyToken");

router.get("/", verifyToken, ChannelController.getChannels);
router.get("/:id/members", verifyToken, ChannelController.GetChannelMember);
router.get(
  "/:channelId/messages",
  verifyToken,
  ChannelController.getRecentMessages
);
module.exports = router;
