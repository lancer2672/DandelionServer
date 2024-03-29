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
const FriendRequestRepository = require("../../api/v1/models/repositories/friendrequest.repo");
const { FRIEND_REQUEST_STATUS, NOTIFICATION_TYPE } = require("../../constant");
const notificationServiceIns = require("../../services/notification");
const {
  NotificationFactory,
} = require("../../classes/factory/NotificationFactory");
const config = require("../../config/appConfig");
const { default: mongoose } = require("mongoose");

const addFriendToFriendList = async (userIdA, userIdB, session) => {
  try {
    const userA = await UserRepository.findOne({ _id: userIdA }, session);
    console.log("userA", userA);
    const checkIfFriend = userA.friends.some(
      (friend) => friend.userId.toString() === userIdB.toString()
    );
    if (!checkIfFriend) {
      userA.friends.push({
        userId: userIdB,
        createdAt: new Date().toISOString(),
      });
      await UserRepository.update({ _id: userIdA }, userA, session);
    }
  } catch (er) {
    console.log(er);
    throw er;
  }
};
const findExistedPendingFriendRequest = async (senderId, receiverId) => {
  return await FriendRequestModel.findOne({
    sender: senderId,
    receiver: receiverId,
    status: FRIEND_REQUEST_STATUS.PENDING,
  });
};
const acceptFriendRequest = async (request, session) => {
  try {
    await FriendRequestRepository.updateFriendRequestStatus(
      request,
      "accepted",
      session
    );
    const channel = await ChannelRepository.findOrCreateChannel(
      "New Chat Room",
      [request.sender, request.receiver],
      session
    );
    channel.isInWaitingList = false;
    await ChannelRepository.updateChannel(channel._id, channel, session);
    return channel;
  } catch (er) {
    console.log(er);
    throw er;
  }
};
const handleAcceptFriendRequest = async (request, session) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  const senderSocketId = onlineUsers[request.sender.toString()]?.socketId;
  const receiverSocketId = onlineUsers[request.receiver.toString()]?.socketId;
  const newChannel = await acceptFriendRequest(request, session);

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

const sendNotificationFriendRequest = async ({
  sender,
  payload,
  receiver,
  description,
}) => {
  const notification = NotificationFactory.createNotification(
    NOTIFICATION_TYPE.FRIEND_REQUEST,
    {
      description,
      receiverId: receiver._id,
      senderId: sender._id,
      payload,
    }
  );
  await notificationServiceIns.publishMessage(notification.stringify());
};
const unFriend = async (data) => {
  const { userId, friendId } = data;
  const socketIO = Global.socketIO;
  const userSocketId = Global.onlineUsers[userId]?.socketId;
  const friendSocketId = Global.onlineUsers[data.friendId]?.socketId;

  console.log({ userId, friendId, userSocketId, friendSocketId });
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserRepository.findById(userId, session);
    const friend = await UserRepository.findById(friendId, session);
    if (!user || !friend) {
      console.log("friend or user not exist");
    }
    user.friends = user.friends.filter(
      (friend) => friend.userId.toString() !== friendId
    );
    await UserRepository.update({ _id: userId }, user, session);

    friend.friends = friend.friends.filter(
      (friend) => friend.userId.toString() !== userId
    );
    await UserRepository.update({ _id: friendId }, friend, session);

    const channel = await ChannelRepository.findChannel({
      memberIds: { $all: [userId, friendId] },
      session,
    });
    if (channel) {
      channel.isInWaitingList = true;
      await ChannelRepository.updateChannel(channel._id, channel, session);
    }
    socketIO.to(userSocketId).emit("unfriend", friendId);
    socketIO.to(friendSocketId).emit("unfriend", userId);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
  } finally {
    session.endSession();
  }
};

//Sender: A receiver: B  A -> to B
const handleFriendRequest = async ({ senderId, receiverId }) => {
  const socketIO = Global.socketIO;
  const onlineUsers = Global.onlineUsers;
  const senderSocketId = onlineUsers[senderId]?.socketId;
  const receiverSocketId = onlineUsers[receiverId]?.socketId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sender = await UserRepository.findById(senderId, session);
    const receiver = await UserRepository.findById(receiverId, session);
    console.log("HANDLEREQUEST");
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
      await addFriendToFriendList(senderId, receiverId, session);
      await addFriendToFriendList(receiverId, senderId, session);
      await handleAcceptFriendRequest(existedRequestBtoA, session);

      console.log(
        "DESCIPRTION",
        config.language.ACCEPT_FRIEND_REQUEST.text(sender.nickname)
      );
      const description = config.language.ACCEPT_FRIEND_REQUEST.text(
        sender.nickname
      );
      // throw new Error("This is a simulated error for testing purposes.");
      await sendNotificationFriendRequest({
        sender,
        receiver,
        payload: {
          notificationId: existedRequestBtoA._id,
          nickname: `${sender.nickname}`,
          avatar: sender.avatar.url,
          message: description,
        },
      });
      console.log("Friend request from B to A is accepted");
    } else {
      const newRequest = new FriendRequestModel({
        sender: senderId,
        receiver: receiverId,
        status: FRIEND_REQUEST_STATUS.PENDING,
      });
      await newRequest.save({ session });
      socketIO.to(senderSocketId).emit("send-friendRequest", "sentRequest");
      socketIO.to(receiverSocketId).emit("send-friendRequest", "accept");

      socketIO.to(receiverSocketId).emit("new-notification");

      const description = config.language.SENT_FRIEND_REQUEST.text(
        sender.nickname
      );

      await sendNotificationFriendRequest({
        sender,
        receiver,
        payload: {
          notificationId: newRequest._id,
          nickname: `${sender.nickname}`,
          avatar: sender.avatar.url,
          message: description,
        },
        description,
      });
      console.log("Created friend request");
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("The transaction was aborted due to an error: " + error);
  } finally {
    session.endSession();
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
