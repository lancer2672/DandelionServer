const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const FriendRequestController = require("../controllers/friendrequest.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

router.get(
  "/requests",
  verifyToken,
  errorHandler(FriendRequestController.getFriendRequests)
);
//find a pending one
router.get(
  "/check-status/:receiverId",
  verifyToken,
  errorHandler(FriendRequestController.checkFriendStatus)
);

module.exports = router;
