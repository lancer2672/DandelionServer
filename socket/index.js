const eventHandler = require("./handler");

const onlineUsers = {};
module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    //to detect user's online status
    const userId = socket.handshake.query.userId;
    onlineUsers[userId] = socket.id;
    console.log("onlineUsers", onlineUsers);
    eventHandler.handleUserOnline(userId);
    socket.broadcast.emit("online-users", onlineUsers);

    socket.on("join-channels", (channelIds) =>
      eventHandler.handleJoinChannels(socket, channelIds)
    );
    socket.on("join-chatRoom", eventHandler.handleSetSeenMessages);
    socket.on("typing", (data) =>
      eventHandler.handleUserTyping(socketIO, data)
    );
    socket.on("send-message", (data) =>
      eventHandler.handleSendMessage(socketIO, data)
    );
    socket.on("send-image", (data) =>
      eventHandler.handleSendImage(socketIO, data)
    );
    socket.on("login", eventHandler.handleLogin);
    socket.on("send-friendRequest", (data) =>
      eventHandler.handleFriendRequest(socketIO, data, onlineUsers)
    );
    socket.on("response-friendRequest", (data) =>
      eventHandler.handleResponseRequest(socketIO, data, onlineUsers)
    );
    socket.on("disconnect", async () => {
      delete onlineUsers[userId];
      console.log("onlineUsers disconnect", onlineUsers);
      await eventHandler.handleUserOffline(userId);
      socket.broadcast.emit("offline-users", userId);
    });
  });
};
