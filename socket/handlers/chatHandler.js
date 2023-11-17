const ChatChannel = require("../../models/channel.model");
const ObjectId = require("mongoose").Types.ObjectId;
const Channel = require("../../models/channel.model");
const User = require("../../models/user.model");
const FriendRequestModel = require("../../models/friendrequest.model");
const NotificationController = require("../../controllers/notification.controller");
const Global = require("../global");

const fs = require("fs");

const emitMessage = (channelId, newMess, type) => {
  const socketIO = Global.socketIO;
  socketIO.to(channelId).emit("receive-message", { newMess, channelId, type });
};
const getChannelMembers = async (userId, channelId) => {
  const channel = await Channel.findById(channelId);
  const receiverId = channel.memberIds.find((memberId) => memberId != userId);
  const receiver = await User.findById(receiverId);
  const sender = await User.findById(userId);
  return { receiver, sender };
};
const sendNotification = async (
  receiver,
  sender,
  channelId,
  notificationTitle
) => {
  const channel = await Channel.findById(channelId);
  await NotificationController.handleSendNotification(
    [receiver.FCMtoken],
    `${sender.nickname} ${notificationTitle}`,
    {
      type: "chat",
      channelId,
      memberIds: JSON.stringify(channel.memberIds),
    },
    "Thông báo"
  );
};
const createMessage = async function (data, messageType) {
  const { channelId, userId } = data;
  let newMess = { userId, isSeen: false, createdAt: new Date() };
  switch (messageType) {
    case "text":
      newMess.message = data.newMessage;
      break;
    case "image":
      newMess.imageUrls = data.imageUrls || [];
      break;
    case "callHistory":
      newMess.callHistory = { duration: data.duration };
      break;
    case "videoMessage":
      newMess.videoUrls = data.videoUrls;
      break;
    default:
      throw new Error("Invalid message type");
  }
  console.log("newmess", newMess);

  const chatChannel = await Channel.findById(channelId);
  chatChannel.channelMessages.unshift(newMess);
  chatChannel.lastUpdate = new Date();
  const savedChatChannel = await chatChannel.save();
  // Get the last message in the array, which is the one we just added
  const savedMessage = savedChatChannel.channelMessages[0];

  return savedMessage;
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
  const userId = this.handshake.query.userId;
  console.log("data", data);
  switch (data.type) {
    case "text":
      handleSendMessage({ ...data, userId });
      break;
    case "image":
      handleSendImage({ ...data, userId });
      break;
    case "callHistory":
      handleSaveCallhistory({ ...data, userId });
      break;
    case "video":
      handleSendVideoMessage({ ...data, userId });
      break;
    default:
      console.log("Unknown data type");
  }
};

const handleSendMessage = async function (data) {
  try {
    const { channelId, userId } = data;
    const newMess = await createMessage(data, "text");

    emitMessage(channelId, newMess, "text");
    const { receiver, sender } = await getChannelMembers(userId, channelId);
    await sendNotification(
      receiver,
      sender,
      channelId,
      "đã gửi cho bạn tin nhắn"
    );
  } catch (e) {
    console.log("Error when sending message", e);
  }
};
const handleSendImage = async function (data) {
  try {
    const { channelId, userId } = data;
    const newMess = await createMessage(data, "image");
    emitMessage(channelId, newMess, "image");
    const { receiver, sender } = await getChannelMembers(userId, channelId);
    await sendNotification(
      receiver,
      sender,
      channelId,
      "đã gửi cho bạn một ảnh"
    );
  } catch (error) {
    console.log("Error when handling image", error);
  }
};
const handleSaveCallhistory = async function (data) {
  try {
    const { channelId, duration, userId } = data;
    const newMess = await createMessage(data, "callHistory");

    const { receiver, sender } = await getChannelMembers(userId, channelId);

    emitMessage(channelId, newMess, "callHistory");
    if (duration == 0) {
      await sendNotification(
        receiver,
        sender,
        channelId,
        "đã bỏ lỡ cuộc gọi từ"
      );
    }
  } catch (error) {
    console.log("Error when saving call history", error);
  }
};
const handleSendVideoMessage = async function (data) {
  const { channelId, userId } = data;
  try {
    const newMess = await createMessage(data, "videoMessage");
    emitMessage(channelId, newMess, "videoMessage");
    const { receiver, sender } = await getChannelMembers(userId, channelId);

    await sendNotification(receiver, sender, channelId, "đã gửi cho bạn video");
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
