const Channel = require("../../api/v1/models/channel.model");
const Global = require("../global");
const {
  NotificationService,
  NotificationType,
} = require("../../api/v1/services/notification.service");
const MessageFactory = require("../../factory/MessageFactory");
const { MESSAGE_TYPE } = require("../../constant");
const ChannelRepository = require("../../api/v1/models/repositories/channel.repo");
const UserRepository = require("../../api/v1/models/repositories/user.repo");
const { ObjectId } = require("mongoose/lib/types");

const emitMessage = (channelId, newMess, type) => {
  const socketIO = Global.socketIO;
  socketIO.to(channelId).emit("receive-message", { newMess, channelId, type });
};
const getChannelMembers = async (userId, channelId) => {
  const channel = await ChannelRepository.findChannels({
    query: { _id: channelId },
  });
  const receiverId = channel.memberIds.find((memberId) => memberId != userId);
  const receiver = await UserRepository.findUsers({
    query: { _id: receiverId },
  });
  const sender = await UserRepository.findUsers({ query: { _id: userId } });
  return { receiver, sender };
};
const sendNotification = async ({ receiver, sender, channelId, message }) => {
  const channel = await ChannelRepository.findChannels({
    query: { _id: channelId },
  });
  console.log("SENDER", receiver.FCMtoken);

  const notificationData = {
    tokens: [receiver.FCMtoken],
    type: NotificationType.CHAT,
    messageData: {
      message,
      notificationId: channelId,
      memberIds: JSON.stringify(channel.memberIds),
      avatar: sender.avatar.url || "",
      nickname: sender.nickname,
    },
  };
  await NotificationService.sendNotification(notificationData);
};
const getNotificationContentByMsgType = (type, sender, messageObj) => {
  switch (type) {
    case MESSAGE_TYPE.TEXT:
      return messageObj.attrs.message;
    case MESSAGE_TYPE.IMAGE:
      return `${sender.nickname} đã gửi cho bạn ảnh`;
    case MESSAGE_TYPE.VIDEO:
      return `${sender.nickname} đã gửi cho bạn video`;
    case MESSAGE_TYPE.CALL_HISTORY:
      return `đã bỏ lỡ cuộc gọi từ ${sender.nickname}`;
    default:
      return "";
  }
};
const createMessage = async function (data) {
  const { channelId, type } = data;
  console.log("createMessage", data);

  const newMessage = await MessageFactory.createMessage(type, data);

  await ChannelRepository.updateChannel(channelId, { lastUpdate: new Date() });
  return newMessage;
};

const handleJoinChannels = function (channelIds = []) {
  console.log("join channels ", channelIds);
  this.join(channelIds);
};
//chat friend (userB) will join to the channel
const handleJoinChannel = function ({ userBId, channelId }) {
  console.log("userBId,ChannelId", userBId, channelId);
  const socketBId = Global.onlineUsers[userBId].socketId;
  const socketB = Global.socketIO.of("/").sockets.get(socketBId);
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

const handleIncomingMessage = async function (data) {
  try {
    const userId = this.handshake.query.userId;
    const { channelId, type: messageType } = data;
    const newMessage = await createMessage(data);

    emitMessage(channelId, newMessage, messageType);
    const { receiver, sender } = await getChannelMembers(userId, channelId);
    console.log("newMessage", newMessage);
    const message = getNotificationContentByMsgType(
      messageType,
      sender,
      newMessage
    );
    await sendNotification({
      receiver,
      sender,
      channelId,
      message,
    });
  } catch (er) {
    console.log("error handling incoming message", er);
  }
};

//join all channels
const handleLogin = async (userId) => {
  try {
    const chatChannels = await ChannelRepository.findChannels({
      query: { usersId: { $in: [userId] } },
    });
    this.emit("get-channels", chatChannels);
  } catch (er) {
    console.log(er);
  }
};

const handleUserOffline = async (userId) => {
  try {
    await UserRepository.update(userId, {
      lastOnline: new Date(),
      isOnline: 0,
    });
  } catch (er) {
    console.log(er);
  }
};
const handleUserOnline = async (userId) => {
  console.log("handleUserOnline", userId);
  try {
    await UserRepository.update(userId, { isOnline: 1 });
  } catch (er) {
    console.log(er);
  }
};

module.exports = {
  handleJoinChannels,
  handleJoinChannel,

  handleIncomingMessage,

  handleLogin,
  handleSetSeenMessages,

  handleUserOffline,
  handleUserOnline,
  handleUserTyping,
};
