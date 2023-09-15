const mongoose = require("mongoose");
const FriendRequest = require("../models/friend-request");
const Notification = require("../models/notification");

const handleMarkNotificationAsSeen = async (socketIO, data, userSocketId) => {
  try {
    const { friendRequestIds, notificationIds } = data;

    const friendRequestObjectIds = friendRequestIds.map((id) =>
      mongoose.Types.ObjectId(id)
    );
    const notificationObjectIds = notificationIds.map((id) =>
      mongoose.Types.ObjectId(id)
    );

    await FriendRequest.updateMany(
      { _id: { $in: friendRequestObjectIds } },
      { $set: { isSeen: true } }
    );

    await Notification.updateMany(
      { _id: { $in: notificationObjectIds } },
      { $set: { isSeen: true } }
    );

    socketIO.to(userSocketId).emit("mark-seen-notification");
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  handleMarkNotificationAsSeen,
};
