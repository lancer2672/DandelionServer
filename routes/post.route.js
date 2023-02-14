const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

const PostController = require("../controllers/post.controller");

router.get("/", verifyToken, PostController.GetAllPosts);

router.put("/react/:id", verifyToken, PostController.HandleReactPost);
router.delete("/comment/:id", verifyToken, PostController.HandleDeleteComment);
router.put("/comment/:id", verifyToken, PostController.HandleCommentPost);

router.put(
  "/:id",
  verifyToken,
  upload.single("updateImage"),
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
