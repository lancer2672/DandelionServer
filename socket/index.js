const chatEventHandler = require("./handlers/chatHandler");
const postEventHandler = require("./handlers/postHandler");
const friendRequestHandler = require("./handlers/friendRequestHandler");
const notificationEventHandler = require("./handlers/notificationHandler");
const locationEventHandler = require("./handlers/locationHandler");
const Global = require("./global");

module.exports = (socketIO) => {
  socketIO.on("connection", (socket) => {
    const onlineUsers = Global.onlineUsers;
    const userId = socket.handshake.query.userId;
    onlineUsers[userId] = { socketId: socket.id, location: null };
    console.log("onlineUsers", onlineUsers);

    chatEventHandler.handleUserOnline(userId);
    socket.on("login", chatEventHandler.handleLogin);
    //chat
    socket.on("join-channels", chatEventHandler.handleJoinChannels);
    //used in case Guest and user do not have channel yet -> create one -> join
    socket.on("join-channel", chatEventHandler.handleJoinChannel);
    socket.on("join-chatRoom", chatEventHandler.handleSetSeenMessages);
    socket.on("typing", chatEventHandler.handleUserTyping);
    socket.on("send-message", chatEventHandler.handleNewMessageType);

    //friend
    socket.on("send-friendRequest", friendRequestHandler.handleFriendRequest);
    socket.on(
      "response-friendRequest",
      friendRequestHandler.handleResponseRequest
    );
    socket.on("unfriend", friendRequestHandler.unFriend);
    //post
    socket.on("upload-comment", postEventHandler.handleUploadComment);
    socket.on("react-post", postEventHandler.handleReactPost);

    //notification
    socket.on(
      "mark-seen-notifications",
      notificationEventHandler.handleMarkNotificationAsSeen
    );
    //location

    socket.on("send-location", locationEventHandler.handleSendLocation);

    //get friend location
    socket.on("start-tracking", locationEventHandler.handleStartTracking);
    socket.on("stop-tracking", locationEventHandler.handleStopTracking);

    socket.on("disconnect", async () => {
      delete onlineUsers[userId];
      console.log("onlineUsers disconnect", onlineUsers);
      await chatEventHandler.handleUserOffline(userId);
      socket.broadcast.emit("offline-users", userId);
    });
  });
};
