const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const { uploadImage } = require("../middleware/upload");
const { body } = require("express-validator");
const errorHandler = require("../middleware/errorHandler");

const PostController = require("../controllers/post.controller");

router.get("/all", verifyToken, errorHandler(PostController.getAllPosts));
router.get(
  "/:userId",
  verifyToken,
  errorHandler(PostController.getPostByUserId)
);
router.get("/", verifyToken, errorHandler(PostController.getPostById));

router.delete(
  "/comment/:id",
  verifyToken,
  errorHandler(PostController.handleDeleteComment)
);
router.put(
  "/react/:id",
  verifyToken,
  errorHandler(PostController.handleReactPost)
);
router.put(
  "/comment/:id",
  verifyToken,
  errorHandler(PostController.handleCommentPost)
);

router.put(
  "/:id",
  verifyToken,
  //TODO
  errorHandler(PostController.handleUpdatePost)
);
router.delete(
  "/:id",
  verifyToken,
  errorHandler(PostController.handleDeletePost)
);
router.post(
  "/create",
  verifyToken,

  //TODO
  errorHandler(PostController.handleCreatePost)
);

module.exports = router;
