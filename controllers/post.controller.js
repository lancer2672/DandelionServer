const fs = require("fs");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find({}).sort({ createdAt: -1 });
  new OK({
    message: "Get all posts success",
    data: { posts },
  }).send(res);
};
exports.getPostByUserId = async (req, res) => {
  const userId = req.params.userId;
  console.log("user", userId);
  const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

  if (posts.length === 0) {
    throw new NotFoundError("No post found for the specified user");
  }
  new OK({
    message: "Get all posts success",
    data: { posts },
  }).send(res);
};

exports.getPostById = async (req, res) => {
  const { postId } = req.query;
  const post = await Post.findById(postId);

  if (!post) {
    throw new NotFoundError("No post found");
  }
  new OK({
    message: "Get posts success",
    data: { post },
  }).send(res);
};
exports.handleReactPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  let isReacted = post.likes.filter((item) => item.userId == req.userId);
  if (isReacted.length === 0) {
    post.likes.push({ userId: req.userId });
  } else {
    post.likes = post.likes.filter((item) => item.userId != req.userId);
  }
  await post.save();
  new OK({
    message: "React success",
    data: {},
  }).send(res);
};

exports.handleDeleteComment = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const commentId = req.body.commentId;
  const newComments = post.comments.filter(
    (comment) => comment._id != commentId
  );
  post.comments = newComments;
  await post.save();
  new OK({
    message: "Success",
    data: { updatedComments: post.comments },
  }).send(res);
};

exports.handleCommentPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const newComment = {
    content: req.body.content,
    userId: req.userId,
  };
  post.comments.push(newComment);
  await post.save();
  new OK({
    message: "Success",
    data: { updatedPost: post },
  }).send(res);
};

exports.handleUpdatePost = async (req, res) => {
  const { description, imageUrl } = req.body;
  let updatedPost = {};
  if (description) {
    updatedPost.description = description;
  }
  if (imageUrl) {
    updatedPost.image = imageUrl;
  }
  updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id },
    updatedPost,
    {
      new: true,
    }
  );
  if (!updatedPost) {
    throw new UnauthorizedError();
  }
  new OK({
    message: "Success",
    data: { updatedPost },
  }).send(res);
};

exports.handleDeletePost = async (req, res) => {
  await Post.deleteOne({ _id: req.params.id });
  new OK({
    message: "Success",
    data: {},
  }).send(res);
};

exports.handleCreatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  const { description, imageUrl } = req.body;
  console.log("imageUrl", imageUrl);

  const newPost = new Post({
    description: description || " ",
    user: req.userId,
    comments: [],
    likes: [],
    image: imageUrl,
  });
  const savedPost = await newPost.save();
  console.log("savedPost", savedPost);

  new OK({
    message: "Success",
    data: { newPost: savedPost },
  }).send(res);
};
