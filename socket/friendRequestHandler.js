const ObjectId = require("mongoose").Types.ObjectId;
const Channel = require("../models/channel");
const User = require("../models/user");
const FriendRequestModel = require("../models/friend-request");
const NotificationController = require("../controllers/notification.controller");

const unFriend = async (socketIO, data) => {
  const { userId, friendId, userSocketId, friendSocketId } = data;
  console.log({ userId, friendId, userSocketId, friendSocketId });

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      console.log("friend or user not exist");
    }
    // Remove friend from user's friends list
    user.friends = user.friends.filter(
      (friend) => friend.userId.toString() !== friendId
    );
    await user.save();

    // Remove user from friend's friends list
    friend.friends = friend.friends.filter(
      (friend) => friend.userId.toString() !== userId
    );
    await friend.save();

    // Find the channel between the two users and set isInWaitingList to true
    const channel = await Channel.findOne({
      memberIds: { $all: [userId, friendId] },
    });
    if (channel) {
      channel.isInWaitingList = true;
      await channel.save();
    }
    socketIO.to(userSocketId).emit("unfriend", friendId);
    socketIO.to(friendSocketId).emit("unfriend", userId);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  unFriend,
};
