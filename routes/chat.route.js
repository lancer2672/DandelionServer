const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/veryfyToken");

router.get("/channel/", verifyToken, ChatController.GetChannels);

module.exports = router;
