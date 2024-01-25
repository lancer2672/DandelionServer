const FriendRequestModel = require("../models/friendrequest.model");
const User = require("../models/user.model");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../../../classes/success/SuccessResponse");

exports.getFriendRequests = async (req, res) => {
  const userId = req.userId;
  const requests = await FriendRequestModel.find({
    receiver: { $in: [userId] },
    status: "pending",
  });
  new OK({
    message: "Success",
    data: { requests },
  }).send(res);
};
exports.checkFriendStatus = async (req, res) => {
  const { receiverId } = req.params;
  const checkedUser = await User.findById(req.userId);
  const isFriend = checkedUser.friends.some((friend) => {
    return friend.userId == receiverId;
  });

  if (isFriend) {
    new OK({
      message: "Success",
      data: { result: "friend" },
    }).send(res);
  } else {
    const hasAPendingRequest1 = await FriendRequestModel.findOne({
      receiver: receiverId,
      senderId: req.userId,
      status: "pending",
    });

    if (hasAPendingRequest1) {
      new OK({
        message: "Success",
        data: { result: "sentRequest" },
      }).send(res);
    } else {
      const hasAPendingRequest2 = await FriendRequestModel.findOne({
        receiver: req.userId,
        senderId: receiverId,
        status: "pending",
      });

      if (hasAPendingRequest2) {
        new OK({
          message: "Success",
          data: { result: "accept" },
        }).send(res);
      } else {
        new OK({
          message: "Success",
          data: { result: "sendFriendRequest" },
        }).send(res);
      }
    }
  }
};
