const User = require("../../models/user");
const Post = require("../../models/post");
const NotificationController = require("../../controllers/notification.controller");
const Global = require("../global");

const handleUploadComment = async function (data) {
  const socketIO = Global.socketIO;
  const { commentUserId, postCreatorId, postId, content } = data;
  const postCreatorSocketId = Global.onlineUsers[postCreatorId];

  console.log("postCreatorSocketId", content);
  try {
    const post = await Post.findById(postId);
    const postCreator = await User.findById(postCreatorId);
    const reactUser = await User.findById(commentUserId);
    const newComment = {
      content: content,
      userId: commentUserId,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    const savedPost = await post.save();
    //to get new comment id
    const savedComment = savedPost.comments[savedPost.comments.length - 1];
    this.emit("new-comment", { postId, newComment: savedComment });
    if (postCreatorId != commentUserId) {
      socketIO
        .to(postCreatorSocketId)
        .emit("new-comment", { postId, newComment });
      socketIO.to(postCreatorSocketId).emit("new-notification");
      await NotificationController.handleSendNotification(
        [postCreator.FCMtoken],
        `${reactUser.nickname} đã bình luận về bài viết của bạn`,
        {
          type: "post/react",
          postId,
          postCreator: JSON.stringify(postCreator),
        },
        commentUserId,
        postCreator._id,
        postId
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
    const { postCreatorId, postId } = data;
    const postCreatorSocketId = Global.onlineUsers[postCreatorId];
    const post = await Post.findById(postId);
    const postCreator = await User.findById(postCreatorId).select("-password");
    const reactUser = await User.findById(reactUserId);
    const userIndex = post.likes.findIndex(
      (item) => item.userId == reactUserId
    );
    const isAddedToList = userIndex === -1;
    isAddedToList
      ? post.likes.push({ userId: reactUserId })
      : post.likes.splice(userIndex, 1);
    await post.save();
    this.emit("react-post", postId, reactUserId, isAddedToList);

    if (postCreatorId != reactUserId && isAddedToList) {
      await NotificationController.handleSendNotification(
        [postCreator.FCMtoken],
        `${reactUser.nickname} đã thích bài viết của bạn`,
        {
          type: "post/react",
          postId,
          postCreator: JSON.stringify(postCreator),
        },
        reactUserId,
        postCreator._id,
        postId
      );
      socketIO.to(postCreatorSocketId).emit("new-notification");
    }
  } catch (er) {
    console.log("er", er);
  }
};

module.exports = {
  handleUploadComment,
  handleReactPost,
};
