const Post = require("../models/post.model");
const {
  NotFoundError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const S3ClientIns = require("../../../external/s3Client");

class PostService {
  static async getAllPosts(limit = 10, skip = 0) {
    return await Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  static async getPostByUserId(userId, limit = 10, skip = 0) {
    return await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async getPostById(postId) {
    return await Post.findById(postId);
  }
  static async handleReactPost(userId, postId) {
    console.log("handleReactPost");
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    let isReacted = post.likes.filter((item) => item.userId == userId);
    if (isReacted.length === 0) {
      post.likes.push({ userId: userId });
    } else {
      post.likes = post.likes.filter((item) => item.userId != userId);
    }
    await post.save();
  }

  static async handleDeleteComment(postId, commentId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    const newComments = post.comments.filter(
      (comment) => comment._id != commentId
    );
    post.comments = newComments;
    await post.save();
  }

  static async handleCommentPost(postId, newComment) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    post.comments.push(newComment);
    await post.save();
  }

  static async handleUpdatePost({ id, payload }) {
    const updatedPost = {};
    const { description, image } = payload;
    if (description) {
      updatedPost.description = description;
    }
    if (image) {
      updatedPost.image = image;
    }
    let post = await Post.findByIdAndUpdate(id, updatedPost, {
      new: true,
    });
    if (!post) {
      throw new UnauthorizedError();
    }
    return post;
  }
  static async handleDeletePost(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    await Post.deleteOne({ _id: postId });
  }

  static async handleCreatePost({ userId, payload }) {
    const { description, image } = payload;
    const postData = {
      description: description || " ",
      user: userId,
      image,
    };
    const newPost = new Post(postData);
    const savedPost = await newPost.save();

    return savedPost;
  }
  static async updateUrl({ postId, fileId }) {
    const newUrl = await S3ClientIns.getSignedUrl(fileId);
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    post.image.url = newUrl;
    await post.save();
    return { url: newUrl };
  }
}

module.exports = PostService;
