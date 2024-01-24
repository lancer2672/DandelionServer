const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const Notification = require("../../models/notification.model");
const Global = require("../global");
const {
  NotificationService,
  NotificationType,
} = require("../../services/notification.service");

const sendNotification = async ({
  postCreator,
  reactor,
  postId,
  notificationMessage,
}) => {
  const notification = new Notification({
    description: `${reactor.nickname} ${notificationMessage}`,
    senderIds: [
      {
        userId: reactor._id,
        createdAt: Date.now(),
      },
    ],
    receiverId: postCreator._id,
    postId,
  });
  await notification.save();

  await NotificationService.sendNotification({
    tokens: [postCreator.FCMtoken],
    messageData: {
      message: `${notificationMessage}`,
      nickname: `${reactor.nickname} `,
      notificationId: postId,
    },
    type: NotificationType.POST,
  });
};

const createNewComment = (content, userId) => ({
  content,
  userId,
  createdAt: new Date(),
  replies: [],
});

const findCommentById = (comments, id) =>
  comments.find((comment) => comment._id == id);

const handleUploadComment = async function (data) {
  const socketIO = Global.socketIO;
  const { commentUserId, postCreatorId, postId, content, parentId } = data;
  const postCreatorSocketId = Global.onlineUsers[postCreatorId]?.socketId;
  console.log("comment data", data);
  try {
    const post = await Post.findById(postId);
    const postCreator = await User.findById(postCreatorId);
    const commentUser = await User.findById(commentUserId);
    let newComment = createNewComment(content, commentUserId);

    if (parentId) {
      let parentComment = findCommentById(post.comments, parentId);
      parentComment.replies.unshift(newComment);
    } else {
      post.comments.unshift(newComment);
    }

    const savedPost = await post.save();

    let savedComment;
    if (parentId) {
      let parentComment = findCommentById(post.comments, parentId);
      savedComment = parentComment.replies[0];
    } else {
      savedComment = savedPost.comments[0];
    }

    socketIO.emit("new-comment", {
      postId,
      newComment: savedComment,
      parentId,
    });

    if (postCreatorId != commentUserId) {
      socketIO.to(postCreatorSocketId).emit("new-notification");
      await sendNotification({
        postCreator,
        reactor: commentUser,
        postId,
        notificationMessage: "commented on your post",
      });
    }
  } catch (er) {
    console.log("er", er);
  }
};
const handleReactPost = async function (data) {
  try {
    const socketIO = Global.socketIO;
    const reactUserId = this.handshake.query.userId;
    const { postCreatorId, postId, addToList } = data;
    const postCreatorSocketId = Global.onlineUsers[postCreatorId]?.socketId;
    const post = await Post.findById(postId);
    const postCreator = await User.findById(postCreatorId).select("-password");
    const reactUser = await User.findById(reactUserId);
    
    let userIndex = post.likes.findIndex((item) => item.userId == reactUserId);

    if (addToList) {
      if (userIndex === -1) {
        post.likes.push({ userId: reactUserId });
      }
    } else {
      userIndex === -1
        ? post.likes.push({ userId: reactUserId })
        : post.likes.splice(userIndex, 1);
    }

    let isAddedToList = userIndex === -1;
    if (addToList === true) {
    }
    if (userIndex !== -1 && addToList === true) {
      isAddedToList = null;
    }
    console.log("react-post", userIndex, isAddedToList);

    await Post.updateOne({ _id: postId }, { likes: post.likes });

    this.emit("react-post", postId, reactUserId, isAddedToList);

    if (postCreatorId != reactUserId && isAddedToList) {
      socketIO.to(postCreatorSocketId).emit("new-notification");
      await sendNotification({
        postCreator,
        reactor: reactUser,
        postId,
        notificationMessage: "reacted your post",
      });
    }
  } catch (er) {
    console.log("er", er);
  }
};

module.exports = {
  handleUploadComment,
  handleReactPost,
};
