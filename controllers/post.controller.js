const fs = require("fs");
const User = require("../models/user");
const Post = require("../models/posts");
const { validationResult } = require("express-validator");
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
exports.getPostByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts found for the specified user.",
      });
    }

    res.json({
      success: true,
      message: "Success",
      data: { posts: posts },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get user posts." });
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
    const post = await Post.findById(req.params.id);
    const newComment = {
      content: req.body.content,
      userId: req.userId,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
  }
  const { description } = req.body;
  console.log("called");
  try {
    const newPost = new Post({
      description: description || " ",
      user: req.userId,
      comments: [],
      likes: [],
      image: req.file?.path || null,
    });
    const savedPost = await newPost.save();
    console.log("savedPost", savedPost);
    res.json({
      success: true,
      message: "create post successfully",
      data: { newPost: savedPost },
    });
  } catch (err) {
    console.log("er", err);
    res.status(400).json({ success: false, message: "create post failed" });
  }
};
