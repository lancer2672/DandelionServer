const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const router = express.Router();

const upload = require("../middleware/upload");

const PostController = require("../controllers/post.controller");

router.get("/", verifyToken, PostController.getAllPosts);

router.put("/react/:id", verifyToken, PostController.handleReactPost);
router.delete("/comment/:id", verifyToken, PostController.handleDeleteComment);
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
