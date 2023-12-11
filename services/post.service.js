const Post = require("../models/post.model");
const {
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");

class PostService {
  static async getAllPosts() {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    if (!posts) {
      throw new NotFoundError("Posts not found");
    }
    return posts;
  }

  static async getPostByUserId(userId) {
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    if (!posts) {
      throw new NotFoundError("Posts not found for the specified user");
    }
    return posts;
  }

  static async getPostById(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    return post;
  }

  static async handleReactPost(userId, postId) {
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
    return post.comments;
  }

  static async handleCommentPost(postId, newComment) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    post.comments.push(newComment);
    await post.save();
    return post;
  }

  static async handleUpdatePost(postId, updatedPost) {
    let post = await Post.findOneAndUpdate({ _id: postId }, updatedPost, {
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

  static async handleCreatePost(newPostData) {
    const newPost = new Post(newPostData);
    const savedPost = await newPost.save();
    return savedPost;
  }
}

module.exports = PostService;
