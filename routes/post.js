const express = require("express");
const multer = require("multer");
const fs = require("fs");

const User = require("../models/users");
const Post = require("../models/posts");
const verifyToken = require("./../middleware/veryfyToken");

const router = express.Router();
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
router.get("/", verifyToken, (req, res) => {
  Post.find({})
    .then((posts) => {
      // TODO: xử lý việc tìm đúng chưa (có post nhưng trả về rỗng)
      res.json({
        success: true,
        message: "got posts",
        posts,
      });
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: "can not all posts" });
    });
});

router.put("/:id", verifyToken, async (req, res) => {
  const { des, reactionNumber, content } = req.body;
  const user = await User.findById(req.userId);
  const newComment = {
    content,
    user: req.userId,
    creatorName: user.nickname,
  };
  try {
    let updatedPost = {};
    if (des) {
      updatedPost.description = des;
    }

    if (content) {
      const post = await Post.findById(req.params.id);

      post.comments.push(newComment);

      await post.save();
    }
    updatedPost = await Post.findOneAndUpdate(
      { id: req.params.id },
      updatedPost,
      {
        new: true,
      }
    );
    //check if user comment
    if (!updatedPost) {
      return res.status(401).json({
        sucess: false,
        message: "You are not authorized or post not found ",
      });
    }
    res.json({ sucess: true, message: "excellent progess", updatedPost });
  } catch (err) {
    return res.status(400).json({ sucess: false, message: "Error!" });
  }
});

router.post("/delete", verifyToken, (req, res) => {});

router.post(
  "/create",
  verifyToken,
  upload.single("postImage"),
  async (req, res) => {
    const { description } = req.body;
    const user = await User.findById(req.userId);

    const newPost = new Post({
      description: description || " ",
      user: req.userId,
      creatorName: user.nickname,
      comments: [],
      likes: [],
    });
    //nếu có kèm ảnh
    if (req.file) {
      newPost.image.data = fs.readFileSync(`uploads/${req.file.filename}`);
    }
    newPost
      .save()
      .then(() => {
        res.json({
          success: true,
          message: "create post successfully",
          newPost,
        });
      })
      .catch((err) => {
        res.status(400).json({ success: false, message: "create post failed" });
      });
  }
);

module.exports = router;
