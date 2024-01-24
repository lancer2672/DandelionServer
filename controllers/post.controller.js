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


exports.handleUpdatePost = async (req, res) => {
  const {id} = req.params
  const post = await PostService.handleUpdatePost({id,payload:req.body});
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
 
  const savedPost = await PostService.handleCreatePost({userId:req.userId,payload:req.body});
  new OK({
    message: "Success",
    data: { newPost: savedPost },
  }).send(res);
};
