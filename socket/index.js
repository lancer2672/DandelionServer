const eventHandlers = require("./handler");

module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    console.log("a user just connected", socket.id);

    socket.on("create-channel", eventHandlers.handleCreateChannel);
    socket.on("join-chat-room", eventHandlers.handleJoinChatRoom);
    socket.on("send-message", ({ channelId, userId, newMessage }) =>
      eventHandlers.handleSendMessage(socketIO, channelId, userId, newMessage)
    );
    socket.on("login", eventHandlers.handleLogin);
    socket.on("friend-request", eventHandlers.handleFriendRequest);
    socket.on("accept-friend-request", eventHandlers.handleAcceptFriendRequest);
  });
};
