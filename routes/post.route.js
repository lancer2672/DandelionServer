const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { uploadImage, uploadVideo } = require("../middleware/upload");
const PostController = require("../controllers/post.controller");
const errorHandler = require("../middleware/errorHandler");

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
router.get("/all", verifyToken, errorHandler(PostController.getAllPosts));

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
  verifyToken,
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
router.get("/", verifyToken, errorHandler(PostController.getPostById));

/**
 * @swagger
 * /post/comment/:id:
 *   delete:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete(
  "/comment/:id",
  verifyToken,
  errorHandler(PostController.handleDeleteComment)
);

/**
 * @swagger
 * /post/react/:id:
 *   put:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post reacted successfully
 */
router.put(
  "/react/:id",
  verifyToken,
  errorHandler(PostController.handleReactPost)
);

/**
 * @swagger
 * /post/comment/:id:
 *   put:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Comment posted successfully
 */
router.put(
  "/comment/:id",
  verifyToken,
  errorHandler(PostController.handleCommentPost)
);

/**
 * @swagger
 * /post/:id:
 *   put:
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put(
  "/:id",
  verifyToken,
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
  verifyToken,
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
  verifyToken,
  //TODO
  errorHandler(PostController.handleCreatePost)
);

module.exports = router;
