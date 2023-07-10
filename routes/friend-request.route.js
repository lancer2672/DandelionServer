const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const FriendRequestController = require("../controllers/friend-request.controller");

const router = express.Router();

router.get("/", verifyToken, FriendRequestController.getRequest);

module.exports = router;
