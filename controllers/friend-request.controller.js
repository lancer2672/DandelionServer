const FriendRequestModel = require("../models/friend-request");
const User = require("../models/user");

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await FriendRequestModel.find({
      receiver: { $in: [userId] },
      status: "pending",
    });
    res.json({
      message: "success",
      data: { requests },
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "cannot get friend requests" });
  }
};
exports.checkFriendStatus = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const checkedUser = await User.findById(req.userId);
    const isFriend = checkedUser.friends.some((friend) => {
      return friend.userId == receiverId;
    });
    console.log("isFriend", isFriend);
    if (isFriend) {
      res.json({
        message: "success",
        data: { result: "friend" },
      });
    } else {
      const hasAPendingRequest1 = await FriendRequestModel.findOne({
        receiver: receiverId,
        senderId: req.userId,
        status: "pending",
      });

      if (hasAPendingRequest1) {
        res.json({
          message: "success",
          data: { result: "sentRequest" },
        });
      } else {
        const hasAPendingRequest2 = await FriendRequestModel.findOne({
          receiver: req.userId,
          senderId: receiverId,
          status: "pending",
        });

        if (hasAPendingRequest2) {
          res.json({
            message: "success",
            data: { result: "accept" },
          });
        } else {
          res.json({
            message: "success",
            data: { result: "sendFriendRequest" },
          });
        }
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ success: false, message: "error" });
  }
};
