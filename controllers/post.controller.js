const fs = require("fs");
const User = require("../models/users");
const Post = require("../models/posts");
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "success",
      data: { posts: posts },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get all posts" });
  }
};

exports.handleReactPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    let isReacted = post.likes.filter((item) => item.userId == req.userId);
    if (isReacted.length === 0) {
      post.likes.push({ userId: req.userId });
    } else {
      post.likes = post.likes.filter((item) => item.userId != req.userId);
    }
    await post.save();
    return res.json({ sucess: true, message: "success" });
  } catch (err) {
    return res.status(401).json({
      sucess: false,
      message: "failed",
    });
  }
};

exports.handleDeleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const commentId = req.body.commentId;
    const newComments = post.comments.filter(
      (comment) => comment._id != commentId
    );
    post.comments = newComments;
    await post.save();
    return res.json({
      sucess: true,
      message: "success",
      data: { updatedComments: post.comments },
    });
  } catch (err) {
    return res.status(401).json({
      sucess: false,
      message: "failed",
    });
  }
};

exports.handleCommentPost = async (req, res) => {
  console.log("req.body", req.body.content);
  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(req.params.id);
    const newComment = {
      content: req.body.content,
      userId: req.userId,
      creatorName: user.nickname,
    };
    post.comments.push(newComment);
    await post.save();
    res.json({
      sucess: true,
      message: "success",
      data: { updatedPost: post },
    });
  } catch (err) {
    res.status(401).json({
      sucess: false,
      message: "failed",
    });
  }
};

exports.handleUpdatePost = async (req, res) => {
  const { description } = req.body;
  try {
    let updatedPost = {};
    if (description) {
      updatedPost.description = description;
    }
    if (req.file) {
      updatedPost.image = req.file.path;
    }
    updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      updatedPost,
      {
        new: true,
      }
    );
    if (!updatedPost) {
      return res.status(401).json({
        sucess: false,
        message: "You are not authorized or post not found ",
      });
    }
    res.json({
      sucess: true,
      message: "success",
      data: { updatedPost },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ sucess: false, message: "Error!" });
  }
};
exports.handleDeletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    return res.json({ success: true, message: "excellent progress" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "cannot delete this post!" });
  }
};

exports.handleCreatePost = async (req, res) => {
  const { description } = req.body;
  try {
    const user = await User.findById(req.userId);
    const newPost = new Post({
      description: description || " ",
      user: req.userId,
      creatorName: user.nickname,
      comments: [],
      likes: [],
    });
    // Post image
    if (req.file) {
      newPost.image = req.file.path;
    }
    const savedPost = await newPost.save();
    res.json({
      success: true,
      message: "create post successfully",
      data: { newPost: savedPost },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "create post failed" });
  }
};
