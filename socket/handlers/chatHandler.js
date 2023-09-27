const ChatChannel = require("../../models/channel");
const ObjectId = require("mongoose").Types.ObjectId;
const Channel = require("../../models/channel");
const User = require("../../models/user");
const FriendRequestModel = require("../../models/friend-request");
const NotificationController = require("../../controllers/notification.controller");
const Global = require("../global");

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
    channel.isInWaitingList = false;
    await channel.save();
    return channel;
  } catch (er) {
    console.log(er);
  }
};

const handleJoinChannels = function (channelIds = []) {
  this.join(channelIds);
};
//chat friend (userB) will join to the channel
const handleJoinChannel = function ({ userBId, channelId }) {
  const socketB = Global.socketIO.of("/").sockets.get(socketBId);
  const socketBId = Global.onlineUsers[userBId].socketId;
  cónt;
  if (socketBId) {
    socketB.join(channelId);
  }
  this.join(channelId);
};
const handleUserTyping = ({ channelId, isTyping, chatFriendId }) => {
  //if friend is online
  if (Global.onlineUsers[chatFriendId]?.socketId) {
    const chatFriendSocketId = Global.onlineUsers[chatFriendId].socketId;
    Global.socketIO
      .to(chatFriendSocketId)
      .emit("typing", channelId, chatFriendId, isTyping);
  }
};

const handleSetSeenMessages = async function ({ channelId }) {
  console.log("JoinRoom: ", channelId);
  try {
    await Channel.updateOne(
      { _id: channelId },
      { $set: { "channelMessages.$[].isSeen": true } }
    );
    this.emit("join-chatRoom", channelId);
  } catch (err) {
    console.log(err);
  }
};

const handleNewMessageType = function (data) {
  switch (data.type) {
    case "message":
      handleSendMessage(data);
      break;
    case "image":
      handleSendImage(data);
      break;
    case "callHistory":
      handleSaveCallhistory(data);
      break;
    case "video":
      handleSendVideoMessage(data);
      break;
    default:
      console.log("Unknown data type");
  }
};
const handleSendMessage = async (data) => {
  try {
    const socketIO = Global.socketIO;
    const { channelId, senderId, newMessage } = data;
    console.log(data);
    console.log(socketIO == null);
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

const handleSendImage = async function ({ channelId, imagesData }) {
  try {
    const socketIO = Global.socketIO;
    const userId = this.handshake.query.userId;
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
const handleSaveCallhistory = async function ({
  channelId,
  senderId,
  duration,
}) {
  const socketIO = Global.socketIO;
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
const handleSendVideoMessage = async function (data) {
  const { channelId, videoUrls } = data;
  const socketIO = Global.socketIO;
  const userId = this.handshake.query.userId;
  try {
    const chatChannel = await Channel.findById(channelId);
    const newMess = {
      _id: new ObjectId(),
      userId,
      videoUrls: videoUrls,
      createdAt: new Date(),
    };
    chatChannel.channelMessages.unshift(newMess);
    await chatChannel.save();
    socketIO
      .to(channelId)
      .emit("receive-message", { newMess, channelId, type: "video" });
    const receiverId = chatChannel.memberIds.find(
      (memberId) => memberId != userId
    );
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(userId);
    await NotificationController.handleSendNotification(
      [receiver.FCMtoken],
      `${sender.nickname} đã gửi cho bạn video`,
      {
        type: "chat",
        channelId,
        memberIds: JSON.stringify(chatChannel.memberIds),
      },
      "Tin nhắn mới"
    );
  } catch (error) {
    console.log("Error when handling video", error);
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

  handleNewMessageType,

  handleLogin,

  handleSetSeenMessages,

  handleUserOffline,
  handleUserOnline,
  handleUserTyping,
};
