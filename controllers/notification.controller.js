const FriendRequest = require("../models/friendrequest.model");
const admin = require("../firebase/firebaseAdmin");
const Notification = require("../models/notification.model");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.handleSendNotification = async (
  tokenList,
  message,
  messageData,
  senderId,
  receiverId,
  postId,
  title = "Thông báo mới"
) => {
  if (senderId && postId) {
    const notification = new Notification({
      description: message,
      userIds: [
        {
          userId: senderId,
          createdAt: Date.now(),
        },
      ],
      receiverId,
      postId,
    });
    await notification.save();
  }
  await admin.messaging().sendToDevice(
    tokenList,
    {
      notification: {
        title,
        body: message,
      },
      data: {
        ...messageData,
        //  ex:
        // type: "chat",
        // channelId: channelId,
        // memberIds: JSON.stringify(memberIds),
      },
    },
    {
      priority: "high",
    }
  );
};
exports.sendNotification = async (req, res) => {
  const { tokenList, message, title } = req.body;
  handleSendNotification(tokenList, message, title);
  new OK({
    message: "Success",
    data: {},
  }).send(res);
};

exports.getAllNotifications = async (req, res) => {
  const notifications = await Notification.find({
    receiverId: req.userId,
    deletedAt: null,
  }).sort({
    createdAt: -1,
  });
  new OK({
    message: "Success",
    data: { notifications },
  }).send(res);
};
exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new BadRequestError("Notification not found");
  }

  notification.deletedAt = new Date();
  await notification.save();
  new OK({
    message: "Success",
    data: {},
  }).send(res);
};
