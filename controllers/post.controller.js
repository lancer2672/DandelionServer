const fs = require("fs");
const User = require("../models/users");
const Post = require("../models/posts");

exports.GetAllPosts = (req, res) => {
  Post.find({})
    .then((posts) => {
      res.json({
        success: true,
        message: "success",
        posts: posts.reverse(),
      });
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: "cannot get all posts" });
    });
};

exports.HandleReactPost = (req, res) => {
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
};

exports.HandleDeleteComment = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      const commentId = req.body.commentId;
      const newComments = post.comments.filter((comment) => {
        return comment._id != commentId;
      });
      post.comments = newComments;
      return post.save();
    })
    .then((post) => {
      return res.json({
        sucess: true,
        message: "success",
        updatedComments: post.comments,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        sucess: false,
        message: "failed",
      });
    });
};

exports.HandleCommentPost = (req, res) => {
  const user = User.findById(req.userId);
  Post.findById(req.params.id)
    .then((post) => {
      const newComment = {
        content: req.body.content,
        userId: req.userId,
        creatorName: user.nickname,
        createdAt: new Date().toISOString(),
      };
      post.comments.push(newComment);
      post
        .save()
        .then(() => {
          res.json({
            sucess: true,
            message: "excellent progess",
            updatedPost: post,
          });
        })
        .catch((err) => {
          res.status(401).json({
            sucess: false,
            message: "failed",
          });
        });
    })
    .catch((err) => {
      res.status(401).json({
        sucess: false,
        message: "failed",
      });
    });
};

exports.HandleUpdatePost = async (req, res) => {
  const { description } = req.body;
  try {
    let updatedPost = {};
    if (description) {
      updatedPost.description = description;
    }
    if (req.file) {
      updatedPost.image = {};
      updatedPost.image.data = fs.readFileSync(`uploads/${req.file.filename}`);
    }
    updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
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
};

exports.HandleDeletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    return res.json({ sucess: true, message: "excellent progess" });
  } catch (err) {
    return res
      .status(400)
      .json({ sucess: false, message: "cannot delete this post!" });
  }
};

exports.HandleCreatePost = (req, res) => {
  const { description } = req.body;
  User.findById(req.userId)
    .then((user) => {
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
      return newPost.save();
    })
    .then((newPost) => {
      res.json({
        success: true,
        message: "create post successfully",
        newPost,
      });
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: "create post failed" });
    });
};
