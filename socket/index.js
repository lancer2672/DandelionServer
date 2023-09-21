const chatEventHandler = require("./chatHandler");
const postEventHandler = require("./postHandler");
const friendRequestHandler = require("./friendRequestHandler");
const notificationEventHandler = require("./notificationHandler");

const onlineUsers = {};

module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    //to detect user's online status
    const userId = socket.handshake.query.userId;
    onlineUsers[userId] = socket.id;
    console.log("onlineUsers", onlineUsers);
    chatEventHandler.handleUserOnline(userId);
    socket.broadcast.emit("online-users", onlineUsers);

    socket.on("join-channels", (channelIds) =>
      chatEventHandler.handleJoinChannels(socket, channelIds)
    );
    socket.on("join-channel", ({ userBId, channelId }) => {
      const socketBId = onlineUsers[userBId];
      chatEventHandler.handleJoinChannel(
        socketIO,
        socket,
        socketBId,
        channelId
      );
    });
    socket.on("join-chatRoom", ({ channelId }) => {
      chatEventHandler.handleSetSeenMessages({ socket, channelId });
    });
    socket.on("typing", (data) => {
      const chatFriendSocketId = onlineUsers[data.chatFriendId];

      if (chatFriendSocketId) {
        chatEventHandler.handleUserTyping(socketIO, {
          ...data,
          chatFriendSocketId,
        });
      }
    });

    socket.on("send-message", (data) => {
      switch (data.type) {
        case "message":
          chatEventHandler.handleSendMessage(socketIO, data);
          break;
        case "image":
          chatEventHandler.handleSendImage(socketIO, { userId, ...data });
          break;
        case "callHistory":
          chatEventHandler.handleSaveCallhistory(socketIO, data);
          break;
        case "video":
          chatEventHandler.handleSendVideoMessage(socketIO, {
            userId,
            ...data,
          });
          break;
        default:
          console.log("Unknown data type");
      }
    });

    socket.on("login", chatEventHandler.handleLogin);
    socket.on("send-friendRequest", (data) =>
      chatEventHandler.handleFriendRequest(socketIO, data, onlineUsers)
    );
    socket.on("response-friendRequest", (data) =>
      chatEventHandler.handleResponseRequest(socketIO, data, onlineUsers)
    );

    socket.on("upload-comment", (data) => {
      const postCreatorSocketId = onlineUsers[data.postCreatorId];
      const commentUserSocketId = onlineUsers[data.commentUserId];
      postEventHandler.handleUploadComment(socketIO, {
        ...data,
        postCreatorSocketId,
        commentUserSocketId,
      });
    });
    socket.on("react-post", (data) => {
      const postCreatorSocketId = onlineUsers[data.postCreatorId];
      postEventHandler.handleReactPost(socketIO, {
        ...data,
        postCreatorSocketId,
        reactUserId: userId,
      });
    });
    socket.on("unfriend", (data) => {
      const userSocketId = onlineUsers[userId];
      const friendSocketId = onlineUsers[data.friendId];
      friendRequestHandler.unFriend(socketIO, {
        ...data,
        userSocketId,
        userId,
        friendSocketId,
      });
    });
    socket.on("mark-seen-notifications", (data) => {
      const userSocketId = onlineUsers[userId];
      notificationEventHandler.handleMarkNotificationAsSeen(
        socketIO,
        data,
        userSocketId
      );
    });

    socket.on("disconnect", async () => {
      delete onlineUsers[userId];
      console.log("onlineUsers disconnect", onlineUsers);
      await chatEventHandler.handleUserOffline(userId);
      socket.broadcast.emit("offline-users", userId);
    });
  });
};
