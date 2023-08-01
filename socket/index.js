const eventHandlers = require("./handler");
const upload = require("../middleware/upload");

module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    console.log("a user just connected", socket.id);

    socket.on("create-channel", eventHandlers.handleCreateChannel);
    socket.on("join-chat-room", eventHandlers.handleJoinChatRoom);
    socket.on("send-message", ({ channelId, userId, newMessage }) =>
      eventHandlers.handleSendMessage(socketIO, channelId, userId, newMessage)
    );
    socket.on("send-image", (data) =>
      eventHandlers.handleSendImage(socketIO, data)
    );
    socket.on("login", eventHandlers.handleLogin);
    socket.on("friend-request", eventHandlers.handleFriendRequest);
    socket.on("accept-friend-request", eventHandlers.handleAcceptFriendRequest);
  });
};
