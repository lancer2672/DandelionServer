const Channel = require("../../api/v1/models/channel.model");
const User = require("../../api/v1/models/user.model");
const FriendRequestModel = require("../../api/v1/models/friendrequest.model");
const {
  NotificationService,
  NotificationType,
} = require("../../api/v1/services/notification.service");

const Global = require("../global");
const ChannelRepository = require("../../api/v1/models/repositories/channel.repo");
const UserRepository = require("../../api/v1/models/repositories/user.repo");
const { FRIEND_REQUEST_STATUS } = require("../../constant");

const addFriendToFriendList = async (userIdA, userIdB) => {
  try {
    const userA = await UserRepository.findOne({ _id: userIdA });
    console.log("userA", userA);
    const checkIfFriend = userA.friends.some(
      (friend) => friend.userId.toString() === userIdB.toString()
    );
    if (!checkIfFriend) {
      userA.friends.push({
        userId: userIdB,
        createdAt: new Date().toISOString(),
      });
      await UserRepository.update({ _id: userIdA }, userA);
    }
  } catch (er) {
    console.log(er);
  }
};
const findExistedPendingFriendRequest = async (senderId, receiverId) => {
  return await FriendRequestModel.findOne({
    sender: senderId,
    receiver: receiverId,
    status: FRIEND_REQUEST_STATUS.PENDING,
  });
};
const acceptFriendRequest = async (request) => {
  try {
    await FriendRequestRepository.updateFriendRequestStatus(
      request,
      "accepted"
    );
    const channel = await ChannelRepository.findOrCreateChannel(
      "New Chat Room",
      [request.sender, request.receiver]
    );
    channel.isInWaitingList = false;
    await ChannelRepository.updateChannel(channel._id, channel);
    return channel;
  } catch (er) {
    console.log(er);
  }
};
const handleAcceptFriendRequest = async (request) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  const senderSocketId = onlineUsers[request.sender.toString()]?.socketId;
  const receiverSocketId = onlineUsers[request.receiver.toString()]?.socketId;
  const newChannel = await acceptFriendRequest(request);

  socketIO.to(senderSocketId).emit("new-channel", newChannel);
  socketIO.to(receiverSocketId).emit("new-channel", newChannel);

  const responseData = {
    requestId: request._id,
    responseValue: FRIEND_REQUEST_STATUS.ACCEPT,
    userIds: [request.sender, request.receiver],
  };
  socketIO.to(senderSocketId).emit("response-friendRequest", responseData);
  socketIO.to(receiverSocketId).emit("response-friendRequest", responseData);
};

const unFriend = async (data) => {
  const { userId, friendId } = data;
  const socketIO = Global.socketIO;
  const userSocketId = Global.onlineUsers[userId]?.socketId;
  const friendSocketId = Global.onlineUsers[data.friendId]?.socketId;

  console.log({ userId, friendId, userSocketId, friendSocketId });

  try {
    const user = await UserRepository.findById(userId);
    const friend = await UserRepository.findById(friendId);
    if (!user || !friend) {
      console.log("friend or user not exist");
    }
    // Remove friend from user's friends list
    user.friends = user.friends.filter(
      (friend) => friend.userId.toString() !== friendId
    );
    await UserRepository.update({ _id: userId }, user);

    // Remove user from friend's friends list
    friend.friends = friend.friends.filter(
      (friend) => friend.userId.toString() !== userId
    );
    await UserRepository.update({ _id: friendId }, friend);

    // Find the channel between the two users and set isInWaitingList to true
    const channel = await ChannelRepository.findOneChannel({
      memberIds: { $all: [userId, friendId] },
    });
    if (channel) {
      channel.isInWaitingList = true;
      await ChannelRepository.updateChannel(channel._id, channel);
    }
    socketIO.to(userSocketId).emit("unfriend", friendId);
    socketIO.to(friendSocketId).emit("unfriend", userId);
  } catch (err) {
    console.error(err);
  }
};

//Sender: A receiver: B  A -> to B
const handleFriendRequest = async ({ senderId, receiverId }) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  const senderSocketId = onlineUsers[senderId]?.socketId;
  const receiverSocketId = onlineUsers[receiverId]?.socketId;
  try {
    const sender = await UserRepository.findById(senderId);
    const receiver = await UserRepository.findById(receiverId);

    const isAlreadyFriend = sender.friends.some(
      (friend) => friend.userId == receiverId
    );
    if (isAlreadyFriend) {
      return;
    }
    const existedRequestAtoB = await findExistedPendingFriendRequest(
      senderId,
      receiverId
    );
    if (existedRequestAtoB) {
      console.log("Friend request from A to B is already pending");
      return;
    }
    const existedRequestBtoA = await findExistedPendingFriendRequest(
      receiverId,
      senderId
    );
    //if existed then accept the request
    if (existedRequestBtoA) {
      await handleAcceptFriendRequest(existedRequestBtoA);
      await addFriendToFriendList(senderId, receiverId);
      await addFriendToFriendList(receiverId, senderId);

      console.log("Friend request from B to A is accepted");

      await NotificationService.sendNotification({
        tokens: [sender.FCMtoken],
        messageData: {
          message: `${receiver.nickname} accepeted your friend request`,
        },
        type: NotificationType.FRIEND_REQUEST,
      });
    } else {
      const newRequest = new FriendRequestModel({
        sender: senderId,
        receiver: receiverId,
        status: FRIEND_REQUEST_STATUS.PENDING,
      });
      await newRequest.save();
      socketIO.to(senderSocketId).emit("send-friendRequest", "sentRequest");
      socketIO.to(receiverSocketId).emit("send-friendRequest", "accept");

      socketIO.to(receiverSocketId).emit("new-notification");
      await NotificationService.sendNotification({
        tokens: [receiver.FCMtoken],
        messageData: {
          notificationId: newRequest._id,
          nickname: `${sender.nickname}`,
          avatar: sender.avatar.url,
          message: `${sender.nickname} sent you a friend request`,
        },
        type: NotificationType.FRIEND_REQUEST,
      });
      console.log("Created friend request");
    }
  } catch (er) {
    console.log(er);
  }
};

const handleResponseRequest = async ({ requestId, responseValue }) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  try {
    const request = await FriendRequestRepository.findExistingRequest(
      requestId,
      responseValue
    );
    const sender = await UserRepository.findOne({ _id: request.sender });
    const senderSocketId = onlineUsers[request.sender.toString()]?.socketId;
    const receiverSocketId = onlineUsers[request.receiver.toString()]?.socketId;
    const receiver = await UserRepository.findOne({ _id: request.receiver });
    if (!request) {
      console.log("Friend request not found");
      return;
    }
    if (responseValue === FRIEND_REQUEST_STATUS.ACCEPT) {
      await FriendRequestRepository.updateFriendRequestStatus(
        request,
        "accepted"
      );
      await addFriendToFriendList(sender._id, receiver._id);
      await addFriendToFriendList(receiver._id, sender._id);
      console.log("Friend request accepted");
    } else if (responseValue === FRIEND_REQUEST_STATUS.DECLINE) {
      await FriendRequestRepository.updateFriendRequestStatus(
        request,
        "declined"
      );

      const responseData = {
        requestId: request._id,
        responseValue: FRIEND_REQUEST_STATUS.DECLINE,
      };
      socketIO.to(senderSocketId).emit("response-friendRequest", responseData);
      socketIO
        .to(receiverSocketId)
        .emit("response-friendRequest", responseData);
      console.log("Friend request declined");
    } else {
      console.log("Invalid status value");
    }
  } catch (er) {
    console.log(er);
  }
};
module.exports = {
  unFriend,
  handleFriendRequest,
  handleResponseRequest,
};
