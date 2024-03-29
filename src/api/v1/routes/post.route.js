const express = require("express");
const PostController = require("../controllers/post.controller");
const errorHandler = require("../../../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Post
 */
/**
 * @swagger
 * /post/all:
 *   get:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: All posts retrieved successfully
 */
router.get("/list", errorHandler(PostController.getAllPosts));

/**
 * @swagger
 * /post/:userId:
 *   get:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post by user ID retrieved successfully
 */
router.get(
  "/:userId",

  errorHandler(PostController.getPostByUserId)
);

/**
 * @swagger
 * /post/:
 *   get:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post by ID retrieved successfully
 */
router.get("/", errorHandler(PostController.getPostById));

/**
 * @swagger
 * /post/:id:
 *   put:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.patch(
  "/:id",

  //TODO
  errorHandler(PostController.handleUpdatePost)
);

/**
 * @swagger
 * /post/:id:
 *   delete:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete(
  "/:id",

  errorHandler(PostController.handleDeletePost)
);

/**
 * @swagger
 * /post/create:
 *   post:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post created successfully
 */
router.post(
  "/create",

  //TODO
  errorHandler(PostController.handleCreatePost)
);

module.exports = router;
