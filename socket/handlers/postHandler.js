const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const NotificationController = require("../../controllers/notification.controller");
const Global = require("../global");

const sendNotification = async (
  postCreator,
  commentUser,
  postId,
  notificationType,
  notificationMessage
) => {
  await NotificationController.handleSendNotification(
    [postCreator.FCMtoken],
    `${commentUser.nickname} ${notificationMessage}`,
    {
      type: notificationType,
      postId,
      postCreator: JSON.stringify(postCreator),
    },
    commentUser._id,
    postCreator._id,
    postId
  );
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
  const postCreatorSocketId = Global.onlineUsers[postCreatorId];

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
      await sendNotification(
        postCreator,
        commentUser,
        postId,
        "post/comment",
        "đã bình luận về bài viết của bạn"
      );
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
    const postCreatorSocketId = Global.onlineUsers[postCreatorId];
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
      await sendNotification(
        postCreator,
        reactUser,
        postId,
        "post/comment",
        "đã thích bài viết của bạn"
      );
    }
  } catch (er) {
    console.log("er", er);
  }
};

module.exports = {
  handleUploadComment,
  handleReactPost,
};
