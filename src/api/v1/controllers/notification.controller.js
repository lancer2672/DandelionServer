const FriendRequest = require("../models/friendrequest.model");
const admin = require("../../../external/firebase");
const Notification = require("../models/notification.model");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const {
  OK,
  CreatedResponse,
} = require("../../../classes/success/SuccessResponse");

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
