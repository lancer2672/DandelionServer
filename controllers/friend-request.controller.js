const FriendRequest = require("../models/friend-request");

exports.getRequest = async (req, res) => {
  try {
    const userId = req.userId;

    // Lấy tất cả các yêu cầu kết bạn chờ đợi của người dùng
    const requests = await FriendRequest.find({ receiver: userId }).populate(
      "sender",
      "nickname email"
    );

    res.json({
      success: true,
      message: "Get friend requests successfully",
      requests,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Cannot get friend requests",
    });
  }
};
