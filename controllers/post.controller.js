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
const PostService = require("../services/post.service");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostService.getAllPosts();
    new OK({
      message: "Get all posts success",
      data: { posts },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getPostByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await PostService.getPostByUserId(userId);

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
    const post = await PostService.getPostById(postId);

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
    await PostService.handleReactPost(req.userId, req.params.id);
    new OK({
      message: "React success",
      data: {},
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.handleDeleteComment = async (req, res) => {
  const updatedComments = await PostService.handleDeleteComment(
    req.params.id,
    req.body.commentId
  );
  new OK({
    message: "Success",
    data: { updatedComments },
  }).send(res);
};

exports.handleCommentPost = async (req, res) => {
  const newComment = {
    content: req.body.content,
    userId: req.userId,
  };
  const updatedPost = await PostService.handleCommentPost(
    req.params.id,
    newComment
  );
  new OK({
    message: "Success",
    data: { updatedPost },
  }).send(res);
};

exports.handleUpdatePost = async (req, res) => {
  const { description, image } = req.body;
  let updatedPost = {};
  if (description) {
    updatedPost.description = description;
  }
  if (image) {
    updatedPost.image = image;
  }
  const post = await PostService.handleUpdatePost(req.params.id, updatedPost);
  new OK({
    message: "Success",
    data: { updatedPost: post },
  }).send(res);
};

exports.handleDeletePost = async (req, res) => {
  await PostService.handleDeletePost(req.params.id);
  new OK({
    message: "Success",
    data: {},
  }).send(res);
};

exports.handleCreatePost = async (req, res) => {
  const { description, image } = req.body;
  const newPostData = {
    description: description || " ",
    user: req.userId,
    comments: [],
    likes: [],
    image,
  };
  const savedPost = await PostService.handleCreatePost(newPostData);
  new OK({
    message: "Success",
    data: { newPost: savedPost },
  }).send(res);
};
