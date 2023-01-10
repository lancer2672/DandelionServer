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

router.get("/", (req, res) => {
  console.log("get posts:");
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
      res.status(400).json({ success: false, message: "cannot get all posts" });
    });
});

router.put("/react/:id", verifyToken, (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      let isReacted = post.likes.filter((item) => {
        return item.userId == req.userId;
      });
      if (isReacted.length == 0) {
        post.likes.push({ userId: req.userId });
      } else {
        post.likes = post.likes.filter((item) => {
          return item.userId != req.userId;
        });
      }
      post
        .save()
        .then(() => {
          return res.json({ sucess: true, message: "excellent progess" });
        })
        .catch((err) => {
          return res.status(401).json({
            sucess: false,
            message: "failed",
          });
        });
    })
    .catch((err) => {
      return res.status(401).json({
        sucess: false,
        message: "failed",
      });
    });
});

router.put("/:id", verifyToken, async (req, res) => {
  const { des, react, content } = req.body;
  const user = await User.findById(req.userId);
  const newComment = {
    content,
    userId: req.userId,
    creatorName: user.nickname,
  };
  try {
    let updatedPost = {};
    if (des) {
      updatedPost.description = des;
    }

    //check if user comment
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

    if (!updatedPost) {
      return res.status(401).json({
        sucess: false,
        message: "You are not authorized or post not found ",
      });
    }
    res.json({ sucess: true, message: "excellent progess", updatedPost });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ sucess: false, message: "Error!" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    return res.json({ sucess: true, message: "excellent progess" });
  } catch (err) {
    return res
      .status(400)
      .json({ sucess: false, message: "cannot delete this post!" });
  }
});

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
