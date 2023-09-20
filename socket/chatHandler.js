const ChatChannel = require("../models/channel");
const ObjectId = require("mongoose").Types.ObjectId;
const Channel = require("../models/channel");
const User = require("../models/user");
const FriendRequestModel = require("../models/friend-request");
const NotificationController = require("../controllers/notification.controller");

const fs = require("fs");

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

    return channel;
  } catch (er) {
    console.log(er);
  }
};

const handleJoinChannels = (socket, channelIds = []) => {
  socket.join(channelIds);
};
const handleJoinChannel = (socketIO, socket, socketBId, channelId) => {
  const socketB = socketIO.of("/").sockets.get(socketBId);
  if (socketBId) {
    socketB.join(channelId);
  }
  socket.join(channelId);
};
const handleUserTyping = (
  socketIO,
  { channelId, isTyping, chatFriendId, chatFriendSocketId }
) => {
  socketIO
    .to(chatFriendSocketId)
    .emit("typing", channelId, chatFriendId, isTyping);
};

const handleSetSeenMessages = async ({ socket, channelId }) => {
  try {
    await Channel.updateOne(
      { _id: channelId },
      { $set: { "channelMessages.$[].isSeen": true } }
    );
    socket.emit("join-chatRoom", channelId);
  } catch (err) {
    console.log(err);
  }
};

const handleSendMessage = async (socketIO, data) => {
  try {
    const { channelId, senderId, newMessage } = data;
    const newMess = {
      _id: new ObjectId(),
      userId: senderId,
      message: newMessage,
      isSeen: false,
      createdAt: new Date(),
    };
    socketIO
      .to(channelId)
      .emit("receive-message", { newMess, channelId, type: "message" });
    const chatChannel = await Channel.findById(channelId);
    const receiverId = chatChannel.memberIds.find(
      (memberId) => memberId != senderId
    );
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    chatChannel.channelMessages.unshift(newMess);
    chatChannel.lastUpdate = new Date();
    await chatChannel.save();

    await NotificationController.handleSendNotification(
      [receiver.FCMtoken],
      `${sender.nickname} đã gửi cho bạn tin nhắn`,
      {
        type: "chat",
        channelId,
        memberIds: JSON.stringify(chatChannel.memberIds),
      },
      "Tin nhắn mới"
    );
  } catch (e) {
    console.log("Error when sending message", e);
  }
};

const handleSendImage = async (socketIO, { channelId, imagesData, userId }) => {
  try {
    const imageUrls = [];
    for (let imageData of imagesData) {
      const fileName = Date.now() + "-" + userId + ".png";
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync("uploads/" + fileName, base64Data, "base64");
      const imageUrl = "/uploads/" + fileName;
      imageUrls.push(imageUrl);
    }

    const chatChannel = await Channel.findById(channelId);
    const newMess = {
      _id: new ObjectId(),
      userId,
      imageUrls: imageUrls,
      createdAt: new Date(),
    };
    chatChannel.channelMessages.unshift(newMess);

    await chatChannel.save();
    socketIO
      .to(channelId)
      .emit("receive-message", { newMess, channelId, type: "image" });
    const receiverId = chatChannel.memberIds.find(
      (memberId) => memberId != userId
    );
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(userId);
    await NotificationController.handleSendNotification(
      [receiver.FCMtoken],
      `${sender.nickname} đã gửi cho bạn một ảnh`,
      {
        type: "chat",
        channelId,
        memberIds: JSON.stringify(chatChannel.memberIds),
      },
      "Tin nhắn mới"
    );
  } catch (error) {
    console.log("Error when handling image", error);
  }
};
const handleSaveCallhistory = async (
  socketIO,
  { channelId, senderId, duration }
) => {
  try {
    console.log("data", channelId, senderId, duration);
    const newMess = {
      _id: new ObjectId(),
      userId: senderId,
      callHistory: { duration },
      isSeen: false,
      createdAt: new Date(),
    };
    socketIO
      .to(channelId)
      .emit("receive-message", { newMess, channelId, type: "callHistory" });
    const chatChannel = await Channel.findById(channelId);
    const receiverId = chatChannel.memberIds.find(
      (memberId) => memberId != senderId
    );
    console.log("newMess", newMess);
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    chatChannel.channelMessages.unshift(newMess);
    chatChannel.lastUpdate = new Date();
    await chatChannel.save();

    if (duration == 0) {
      await NotificationController.handleSendNotification(
        [receiver.FCMtoken],
        `Bạn đã bỏ lỡ cuộc gọi từ ${sender.nickname}`,
        {
          type: "chat",
          channelId,
          memberIds: JSON.stringify(chatChannel.memberIds),
        },
        "Thông báo"
      );
    }
  } catch (error) {
    console.log("Error when saving call history", error);
  }
};
const handleLogin = async (userId) => {
  try {
    const chatChannels = await ChatChannel.find({ usersId: { $in: [userId] } });
    this.emit("get-channels", chatChannels);
  } catch (er) {
    console.log(er);
  }
};

//Sender: A receiver: B  A -> to B
const handleFriendRequest = async (
  socketIO,
  { senderId, receiverId },
  onlineUsers
) => {
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

    if (existedRequestBtoA) {
      const newChannel = await acceptFriendRequest(existedRequestBtoA);
      console.log("newChannel", newChannel);
      await NotificationController.handleSendNotification(
        [sender.FCMtoken],
        `${receiver.nickname} đã chấp nhận lời mời kết bạn của bạn`
      );
      socketIO.to(onlineUsers[senderId]).emit("new-notification");

      socketIO.to(onlineUsers[senderId]).emit("new-channel", newChannel);
      socketIO.to(onlineUsers[receiverId]).emit("new-channel", newChannel);

      socketIO.to(onlineUsers[senderId]).emit("response-friendRequest", {
        requestId: existedRequestBtoA._id,
        responseValue: "accept",
      });
      socketIO.to(onlineUsers[receiverId]).emit("response-friendRequest", {
        requestId: existedRequestBtoA._id,
        responseValue: "accept",
      });

      await addFriendToFriendList(senderId, receiverId);
      await addFriendToFriendList(receiverId, senderId);

      console.log("Friend request from B to A is accepted");
    } else {
      const newRequest = new FriendRequestModel({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });
      await newRequest.save();
      socketIO
        .to(onlineUsers[senderId])
        .emit("send-friendRequest", "sentRequest");
      socketIO.to(onlineUsers[receiverId]).emit("send-friendRequest", "accept");

      socketIO.to(onlineUsers[senderId]).emit("new-notification");
      await NotificationController.handleSendNotification(
        [receiver.FCMtoken],
        `${sender.nickname} đã gửi cho bạn lời mời kết bạn`
      );
    }
  } catch (er) {
    console.log(er);
  }
};

const handleResponseRequest = async (
  socketIO,
  { requestId, responseValue },
  onlineUsers
) => {
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

      request.status = "accepted";
      await request.save();
      await NotificationController.handleSendNotification(
        [sender.FCMtoken],
        `${receiver.nickname} đã chấp nhận lời mời kết bạn của bạn`
      );
      await addFriendToFriendList(sender._id, receiver._id);
      await addFriendToFriendList(receiver._id, sender._id);
      // socketIO.to(request.sender).emit("new-channel", channel);
      // socketIO.to(request.receiver).emit("new-channel", channel);

      socketIO
        .to(onlineUsers[request.sender._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "accept",
        });
      socketIO
        .to(onlineUsers[request.receiver._id])
        .emit("response-friendRequest", {
          requestId: request._id,
          responseValue: "accept",
        });
      console.log("Friend request accepted and new chat room created");
    } else if (responseValue === "decline") {
      request.status = "declined";
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
      await request.save();
      console.log("Friend request declined");
    } else {
      console.log("Invalid status value");
    }
  } catch (er) {
    console.log(er);
  }
};
const handleUserOffline = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.lastOnline = new Date();
      user.isOnline = 0;
    }
    await user.save();
  } catch (er) {
    console.log(er);
  }
};
const handleUserOnline = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.isOnline = 1;
    }
    await user.save();
  } catch (er) {
    console.log(er);
  }
};
module.exports = {
  handleJoinChannels,
  handleJoinChannel,
  handleSetSeenMessages,
  handleSendMessage,
  handleSaveCallhistory,
  handleLogin,
  handleFriendRequest,
  handleResponseRequest,
  handleSendImage,
  handleUserOffline,
  handleUserOnline,
  handleUserTyping,
};
