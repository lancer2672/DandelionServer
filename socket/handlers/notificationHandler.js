const mongoose = require("mongoose");
const FriendRequest = require("../../models/friendrequest.model");
const Notification = require("../../models/notification.model");
const Global = require("../global");

const handleMarkNotificationAsSeen = async function (data) {
  try {
    const userId = this.handshake.query.userId;
    const { friendRequestIds, notificationIds } = data;
    const socketIO = Global.socketIO;
    const userSocketId = Global.onlineUsers[userId].socketId;
    
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
