const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const upload = require("../middleware/upload");
const { body } = require("express-validator");

const PostController = require("../controllers/post.controller");

router.get("/all", verifyToken, PostController.getAllPosts);
router.get("/:userId", verifyToken, PostController.getPostByUserId);
router.get("/", verifyToken, PostController.getPostById);

router.delete("/comment/:id", verifyToken, PostController.handleDeleteComment);
router.put("/react/:id", verifyToken, PostController.handleReactPost);
router.put("/comment/:id", verifyToken, PostController.handleCommentPost);

router.put(
  "/:id",
  verifyToken,
  upload.single("updateImage"),
  PostController.handleUpdatePost
);
router.delete("/:id", verifyToken, PostController.handleDeletePost);
router.post(
  "/create",
  verifyToken,

  upload.single("postImage"),
  PostController.handleCreatePost
);

module.exports = router;
