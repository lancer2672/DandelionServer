const Global = require("../global");
const User = require("../../models/user.model");

const getFriendsSocket = (friends) => {
  const friendIds = friends.map((friend) => friend.userId);
  const friendSocketIds = friendIds.reduce((acc, friendId, i) => {
    const friendSocketId = Global.onlineUsers[friendId]?.socketId;
    if (friendSocketId) {
      acc.push(friendSocketId);
    }
    return acc;
  }, []);
  return friendSocketIds;
};
const handleSendLocation = async function (data) {
  const socketIO = Global.socketIO;
  const userId = this.handshake.query.userId;
  try {
    const user = await User.findById(userId);
    const friendSocketIds = getFriendsSocket(user.friends);
    Global.onlineUsers[userId].location = data.location;
    console.log("friendSocketIds", friendSocketIds);
    //send user's location to their friends
    friendSocketIds.forEach((sId) => {
      socketIO.to(sId).emit("send-location", {
        userId,
        location: data.location,
      });
    });
    console.log("send location Global.onlineUsers", Global.onlineUsers);
  } catch (er) {
    console.log(er);
  }
};
const handleStartTracking = async function (data) {
  const userId = this.handshake.query.userId;
  const socketIO = Global.socketIO;
  try {
    const user = await User.findById(userId);
    const friendsLocation = [];
    //get friend's location and send it to user
    user.friends.forEach((friend) => {
      if (Global.onlineUsers[friend.userId]?.location) {
        friendsLocation.push({
          userId: friend.userId,
          location: Global.onlineUsers[friend.userId].location,
        });
      }
    });
    console.log("friendsLocation", friendsLocation);
    this.emit("start-tracking", friendsLocation);
  } catch (er) {
    console.log(er);
    t;
  }
};

const handleStopTracking = async function () {
  const userId = this.handshake.query.userId;
  try {
    const user = await User.findById(userId);
    const friendSocketIds = getFriendsSocket(user.friends);
    const socketIO = Global.socketIO;
    delete Global.onlineUsers[userId];
    friendSocketIds.forEach((sId) => {
      socketIO.to(sId).emit("stop-tracking", userId);
    });
  } catch (er) {
    console.log("stop tracking err", er);
  }
};

module.exports = {
  handleSendLocation,
  handleStartTracking,
  handleStopTracking,
};
