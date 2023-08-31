const eventHandler = require("./handler");

const onlineUsers = {};
module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    //to detect user's online status
    const userId = socket.handshake.query.userId;
    onlineUsers[userId] = true;
    console.log("onlineUsers", onlineUsers);
    eventHandler.handleUserOnline(userId);
    socket.broadcast.emit("online-users", onlineUsers);

    socket.on("join-chatRoom", eventHandler.handleJoinChatRoom);
    socket.on(
      "send-message",
      async ({ channelId, userId, newMessage }) =>
        await eventHandler.handleSendMessage(
          socketIO,
          channelId,
          userId,
          newMessage
        )
    );
    socket.on(
      "send-image",
      async (data) => await eventHandler.handleSendImage(socketIO, data)
    );
    socket.on("login", eventHandler.handleLogin);
    socket.on("send-friendRequest", (data) =>
      eventHandler.handleFriendRequest(socketIO, data)
    );
    socket.on("response-friendRequest", (data) =>
      eventHandler.handleResponseRequest(socketIO, data)
    );
    socket.on("disconnect", async () => {
      delete onlineUsers[userId];
      console.log("onlineUsers", onlineUsers);
      await eventHandler.handleUserOffline(userId);
      socket.broadcast.emit("offline-users", userId);
    });
  });
};
