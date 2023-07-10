const ChatChannel = require("../models/channel");
const ObjectId = require("mongoose").Types.ObjectId;

function handleCreateChannel(roomName) {
  console.log("creating channel", roomName);
}

function handleJoinChatRoom(channelId) {
  console.log("join channelId", channelId);
  this.join(channelId);
}

async function handleSendMessage(socketIO, channelId, userId, newMessage) {
  try {
    const chatChannels = await ChatChannel.findById(channelId);
    const lastItem = chatChannels.channelMessages.slice(-1)[0];
    console.log("lastItem", lastItem);
    if (lastItem) {
      if (lastItem.userId === userId) {
        lastItem.messageBox.unshift({
          _id: new ObjectId(),
          message: newMessage,
          createdAt: new Date(),
        });
      } else {
        chatChannels.channelMessages.unshift({
          _id: new ObjectId(),
          userId,
          messageBox: [
            {
              _id: new ObjectId(),
              message: newMessage,
              createdAt: new Date(),
            },
          ],
        });
      }
    } else {
      chatChannels.channelMessages.unshift({
        _id: new ObjectId(),
        userId,
        messageBox: [
          {
            _id: new ObjectId(),
            message: newMessage,
            createdAt: new Date(),
          },
        ],
      });
    }
    await chatChannels.save();
    // this.emit("updated-channels", chatChannels);
    socketIO.to(channelId).emit("updated-channels", chatChannels);
  } catch (e) {
    console.log("Error when sending message", e);
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
  socketIO.to(receiverId).emit("friend-request-received", newRequest);

  console.log("Friend request sent");
}

async function handleAcceptFriendRequest(requestId) {
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    console.log("Friend request not found");
    return;
  }

  // Tạo phòng chat mới
  const newChannel = new Channel({
    channelName: "New Chat Room",
    membersId: [request.sender, request.receiver],
    channelMessages: [],
  });

  await newChannel.save();

  // Xóa yêu cầu kết bạn đã được chấp nhận
  await FriendRequest.findByIdAndDelete(requestId);

  // Gửi thông báo cho cả hai người dùng về việc phòng chat mới đã được tạo
  socketIO.to(request.sender).emit("new-chat-room", newChannel);
  socketIO.to(request.receiver).emit("new-chat-room", newChannel);
  console.log("Friend request accepted and new chat room created");
}

module.exports = {
  handleCreateChannel,
  handleJoinChatRoom,
  handleSendMessage,
  handleLogin,
  handleFriendRequest,
  handleAcceptFriendRequest,
};
