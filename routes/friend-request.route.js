const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const FriendRequestController = require("../controllers/friend-request.controller");

const router = express.Router();

router.get("/requests", verifyToken, FriendRequestController.getFriendRequests);
//find a pending one
router.get(
  "/check-status/:receiverId",
  verifyToken,
  FriendRequestController.checkFriendStatus
);

module.exports = router;
