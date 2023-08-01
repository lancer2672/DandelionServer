const ChatChannel = require("../models/channel");
const ObjectId = require("mongoose").Types.ObjectId;
const Channel = require("../models/channel");
const fs = require("fs");

function handleCreateChannel(roomName) {
  console.log("creating channel", roomName);
}

function handleJoinChatRoom(channelId) {
  console.log("join channelId", channelId);
  this.join(channelId);
}
async function handleSendMessage(io, channelId, userId, newMessage) {
  try {
    const chatChannel = await Channel.findById(channelId);
    const newMess = {
      _id: new ObjectId(),
      userId,
      message: newMessage,
      createdAt: new Date(),
    };
    chatChannel.channelMessages.unshift(newMess);
    await chatChannel.save();
    io.to(channelId).emit("receive-message", newMess);
  } catch (e) {
    console.log("Error when sending message", e);
  }
}

async function handleSendImage(io, { channelId, userId, imageData }) {
  try {
    const fileName = Date.now() + "-" + userId + ".png";

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("uploads/" + fileName, base64Data, "base64");
    const imageUrl = "http://192.168.153.72:3000/uploads/" + fileName;

    const chatChannel = await Channel.findById(channelId);
    const newMess = {
      _id: new ObjectId(),
      userId,
      imageUrl: imageUrl,
      createdAt: new Date(),
    };
    chatChannel.channelMessages.unshift(newMess);
    await chatChannel.save();

    io.to(channelId).emit("receive-image", newMess);
  } catch (error) {
    console.log("Error when handling image", error);
  }
}

async function handleLogin(userId) {
  const chatChannels = await ChatChannel.find({ usersId: { $in: [userId] } });
  this.emit("get-channels", chatChannels);
}

async function handleFriendRequest({ senderId, receiverId }) {
  const newRequest = new FriendRequest({
    sender: senderId,
    receiver: receiverId,
  });

  await newRequest.save();

  // Gửi thông báo đến người nhận yêu cầu kết bạn
  io.to(receiverId).emit("friend-request-received", newRequest);

  console.log("Friend request sent");
}

async function handleAcceptFriendRequest(requestId) {
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    console.log("Friend request not found");
    return;
  }

  const newChannel = new Channel({
    channelName: "New Chat Room",
    membersId: [request.sender, request.receiver],
    channelMessages: [],
  });

  await newChannel.save();

  await FriendRequest.findByIdAndDelete(requestId);

  io.to(request.sender).emit("new-chat-room", newChannel);
  io.to(request.receiver).emit("new-chat-room", newChannel);
  console.log("Friend request accepted and new chat room created");
}

module.exports = {
  handleCreateChannel,
  handleJoinChatRoom,
  handleSendMessage,
  handleLogin,
  handleFriendRequest,
  handleAcceptFriendRequest,
  handleSendImage,
};
