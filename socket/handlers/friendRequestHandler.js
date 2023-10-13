const Channel = require("../../models/channel");
const User = require("../../models/user");
const FriendRequestModel = require("../../models/friend-request");
const NotificationController = require("../../controllers/notification.controller");
const Global = require("../global");

const findOrCreateChannel = async (channelName, memberIds) => {
  try {
    let channel = await Channel.findOne({ memberIds: { $all: memberIds } });
    if (!channel) {
      channel = new Channel({
        channelName,
        memberIds,
        channelMessages: [],
      });
      await channel.save();
      console.log("Channel created successfully!");
    } else {
      channel.isInWaitingList = true;
      await channel.save();
    }
    return channel;
  } catch (err) {
    console.error("Error finding or creating channel", err);
  }
};
const addFriendToFriendList = async (userIdA, userIdB) => {
  try {
    const userA = await User.findById(userIdA);
    const checkIfFriend = userA.friends.some(
      (friend) => friend.userId == userIdB
    );
    if (!checkIfFriend) {
      userA.friends.push({
        userId: userIdB,
        createdAt: new Date().toISOString(),
      });
      await userA.save();
    }
  } catch (er) {
    console.log(er);
  }
};
const findExistedPendingFriendRequest = async (senderId, receiverId) => {
  return await FriendRequestModel.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });
};
const acceptFriendRequest = async (request) => {
  try {
    request.status = "accepted";
    await request.save();
    const channel = await findOrCreateChannel("New Chat Room", [
      request.sender,
      request.receiver,
    ]);
    channel.isInWaitingList = false;
    await channel.save();
    return channel;
  } catch (er) {
    console.log(er);
  }
};
const unFriend = async (socketIO, data) => {
  const { userId, friendId } = data;
  const userSocketId = Global.onlineUsers[userId];
  const friendSocketId = Global.onlineUsers[data.friendId];

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

//Sender: A receiver: B  A -> to B
const handleFriendRequest = async ({ senderId, receiverId }) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    const checkIfFriend = sender.friends.some(
      (friend) => friend.userId == receiverId
    );
    if (checkIfFriend) {
      return;
    }
    const existedRequestAtoB = await findExistedPendingFriendRequest(
      senderId,
      receiverId
    );
    if (existedRequestAtoB) {
      console.log("Friend request from A to B is already pending");
      return;
    }
    const existedRequestBtoA = await findExistedPendingFriendRequest(
      receiverId,
      senderId
    );
    //if existed then accept the request
    if (existedRequestBtoA) {
      const newChannel = await acceptFriendRequest(existedRequestBtoA);
      console.log("newChannel", newChannel);
      socketIO.to(onlineUsers[senderId].socketId).emit("new-notification");

      socketIO
        .to(onlineUsers[senderId].socketId)
        .emit("new-channel", newChannel);
      socketIO
        .to(onlineUsers[receiverId].socketId)
        .emit("new-channel", newChannel);

      socketIO
        .to(onlineUsers[senderId].socketId)
        .emit("response-friendRequest", {
          requestId: existedRequestBtoA._id,
          responseValue: "accept",
          userIds: [senderId, receiverId],
        });
      socketIO
        .to(onlineUsers[receiverId].socketId)
        .emit("response-friendRequest", {
          requestId: existedRequestBtoA._id,
          responseValue: "accept",
          userIds: [senderId, receiverId],
        });

      await addFriendToFriendList(senderId, receiverId);
      await addFriendToFriendList(receiverId, senderId);

      console.log("Friend request from B to A is accepted");
      await NotificationController.handleSendNotification(
        [sender.FCMtoken],
        `${receiver.nickname} đã chấp nhận lời mời kết bạn của bạn`
      );
    } else {
      const newRequest = new FriendRequestModel({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });
      await newRequest.save();
      console.log("onlineUsers[senderId]", onlineUsers[senderId]);
      socketIO
        .to(onlineUsers[senderId])
        .emit("send-friendRequest", "sentRequest");
      socketIO.to(onlineUsers[receiverId]).emit("send-friendRequest", "accept");

      socketIO.to(onlineUsers[receiverId]).emit("new-notification");
      await NotificationController.handleSendNotification(
        [receiver.FCMtoken],
        `${sender.nickname} đã gửi cho bạn lời mời kết bạn`
      );
    }
  } catch (er) {
    console.log(er);
  }
};

const handleResponseRequest = async ({ requestId, responseValue }) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  try {
    const request = await FriendRequestModel.findById(requestId);
    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);
    if (!request) {
      console.log("Friend request not found");
      return;
    }
    if (responseValue === "accept") {
      const channel = await findOrCreateChannel("New Chat Room", [
        request.sender,
        request.receiver,
      ]);
      channel.isInWaitingList = false;
      request.status = "accepted";
      await channel.save();
      await request.save();
      await addFriendToFriendList(sender._id, receiver._id);
      await addFriendToFriendList(receiver._id, sender._id);
      // socketIO.to(request.sender).emit("new-channel", channel);
      // socketIO.to(request.receiver).emit("new-channel", channel);

      socketIO
        .to(onlineUsers[request.sender._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "accept",
          userIds: [sender._id, receiver._id],
        });
      socketIO
        .to(onlineUsers[request.receiver._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "accept",
          userIds: [sender._id, receiver._id],
        });
      console.log("Friend request accepted");
      await NotificationController.handleSendNotification(
        [sender.FCMtoken],
        `${receiver.nickname} đã chấp nhận lời mời kết bạn của bạn`
      );
    } else if (responseValue === "decline") {
      request.status = "declined";
      await request.save();
      socketIO
        .to(onlineUsers[request.sender._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "decline",
        });
      socketIO
        .to(onlineUsers[request.receiver._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "decline",
        });
      console.log("Friend request declined");
    } else {
      console.log("Invalid status value");
    }
  } catch (er) {
    console.log(er);
  }
};
module.exports = {
  unFriend,
  handleFriendRequest,
  handleResponseRequest,
};
