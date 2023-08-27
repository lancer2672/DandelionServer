const FriendRequest = require("../models/friend-request");
const admin = require("../firebase/firebaseAdmin");

exports.handleSendNotification = async (
  tokenList,
  message,
  title = "Thông báo mới"
) => {
  await admin.messaging().sendToDevice(
    tokenList,
    {
      notification: {
        title,
        body: message,
      },
    },
    {
      priority: "high",
    }
  );
};
exports.sendNotification = async (req, res) => {
  try {
    const { tokenList, message, title } = req.body;
    handleSendNotification(tokenList, message, title);
    res.json({
      success: true,
      message: "Send notification successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Cannot send notification",
    });
  }
};
