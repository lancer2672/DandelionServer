const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const router = express.Router();

const upload = require("../middleware/upload");

const PostController = require("../controllers/post.controller");

router.get("/", verifyToken, PostController.getAllPosts);

router.put("/react/:id", verifyToken, PostController.HandleReactPost);
router.delete("/comment/:id", verifyToken, PostController.HandleDeleteComment);
router.put("/comment/:id", verifyToken, PostController.HandleCommentPost);

router.put(
  "/:id",
  verifyToken,
  upload.single("postImage"),
  PostController.HandleUpdatePost
);
router.delete("/:id", verifyToken, PostController.HandleDeletePost);
router.post(
  "/create",
  verifyToken,
  upload.single("postImage"),
  PostController.HandleCreatePost
);

module.exports = router;
