const fs = require("fs");
const User = require("../models/user");
const Post = require("../models/post");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    new OK({
      message: "Get all posts success",
      data: { posts },
    }).send(res);
  } catch (err) {
    throw new BadRequestError("Cannot get all posts");
  }
};
exports.getPostByUserId = async (req, res) => {
  try {
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
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.query;
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError("No post found");
    }
    new OK({
      message: "Get posts success",
      data: { post },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
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
    new OK({
      message: "React success",
      data: {},
    }).send(res);
  } catch (err) {
    throw new BadRequestError("React failed");
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
    new OK({
      message: "Success",
      data: { updatedComments: post.comments },
    }).send(res);
  } catch (err) {
    throw new BadRequestError("Upload comment failed");
  }
};

exports.handleCommentPost = async (req, res) => {
  try {
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
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.handleUpdatePost = async (req, res) => {
  const { description, imageUrl } = req.body;
  try {
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
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.handleDeletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    new OK({
      message: "Success",
      data: {},
    }).send(res);
  } catch (err) {
    throw new InternalServerError("Cannot delete this post");
  }
};

exports.handleCreatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  const { description, imageUrl } = req.body;
  console.log("imageUrl", imageUrl);
  try {
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
  } catch (err) {
    throw new InternalServerError("Create post failed");
  }
};
