const ChatChannel = require("../../models/channel.model");
const Channel = require("../../models/channel.model");
const User = require("../../models/user.model");
const Global = require("../global");
const {
  NotificationService,
  NotificationType,
} = require("../../services/notification.service");

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
const sendNotification = async ({ receiver, sender, channelId, message }) => {
  const channel = await Channel.findById(channelId);
  console.log("SENDER", receiver.FCMtoken);

  const notificationData = {
    tokens: [receiver.FCMtoken],
    type: NotificationType.CHAT,
    messageData: {
      message,
      channelId,
      memberIds: JSON.stringify(channel.memberIds),
      avatar: sender.avatar || "",
      nickname: sender.nickname,
    },
  };
  await NotificationService.sendNotification(notificationData);
};
const createMessage = async function (data) {
  const { channelId, userId, type } = data;
  console.log("createMessage", data);
  let newMess = {
    userId,
    type,
    isSeen: false,
    createdAt: new Date(),
  };
  let attrs;
  switch (type) {
    case "text":
      attrs = { message: data.newMessage };
      break;
    case "image":
      attrs = { imageUrls: data.imageUrls };
      break;
    case "callHistory":
      attrs = { callHistory: { duration: data.duration } };
      break;
    case "videoMessage":
      attrs = { videoUrls: data.videoUrls };
      break;
    default:
      throw new Error("Invalid message type");
  }
  newMess.attrs = attrs;
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

const handleIncomingMessage = function (data) {
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
    const newMess = await createMessage(data);

    emitMessage(channelId, newMess, "text");
    const { receiver, sender } = await getChannelMembers(userId, channelId);
    await sendNotification({
      receiver,
      sender,
      channelId,
      message: newMess.attrs.message,
    });
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
    await sendNotification({
      receiver,
      sender,
      channelId,
      message: `${sender.nickname} đã gửi cho bạn một ảnh`,
    });
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
      await sendNotification({
        receiver,
        sender,
        channelId,
        message: `đã bỏ lỡ cuộc gọi từ ${sender.nickname}`,
      });
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

    await sendNotification({
      receiver,
      sender,
      channelId,
      message: `${sender.nickname} đã gửi cho bạn video`,
    });
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

  handleIncomingMessage,

  handleLogin,
  handleSetSeenMessages,

  handleUserOffline,
  handleUserOnline,
  handleUserTyping,
};
