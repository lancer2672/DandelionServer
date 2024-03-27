const Post = require("../models/post.model");
const {
  NotFoundError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const S3ClientIns = require("../../../external/s3Client");
const redisClientInstance = require("../../../external/redis");
const { DEFAULT_CLIENT } = require("../../../constant");

class PostService {
  static async getAllPosts(limit, skip) {
    return new Promise((resolve, reject) => {
      redisClientInstance
        .getClient(DEFAULT_CLIENT)
        .get(`allPosts:${skip}:${limit}`, async (err, postData) => {
          if (postData) {
            resolve(JSON.parse(postData));
          } else {
            const posts = await Post.find({})
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit);
            if (!posts) {
              reject(new NotFoundError("Posts not found"));
            } else {
              redisClientInstance
                .getClient(DEFAULT_CLIENT)
                .set(`allPosts:${skip}:${limit}`, JSON.stringify(posts));
              resolve(posts);
            }
          }
        });
    });
  }

  static async getPostByUserId(userId, limit, skip) {
    return new Promise((resolve, reject) => {
      redisClientInstance
        .getClient(DEFAULT_CLIENT)
        .get(`userPosts:${userId}:${skip}:${limit}`, async (err, postData) => {
          if (postData) {
            resolve(JSON.parse(postData));
          } else {
            const posts = await Post.find({ user: userId })
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit);
            if (!posts) {
              reject(
                new NotFoundError("Posts not found for the specified user")
              );
            } else {
              redisClientInstance
                .getClient(DEFAULT_CLIENT)
                .set(
                  `userPosts:${userId}:${skip}:${limit}`,
                  JSON.stringify(posts)
                );
              resolve(posts);
            }
          }
        });
    });
  }

  static async getPostById(postId) {
    return new Promise((resolve, reject) => {
      redisClientInstance
        .getClient(DEFAULT_CLIENT)
        .get(`post:${postId}`, async (err, postData) => {
          if (postData) {
            resolve(JSON.parse(postData));
          } else {
            const post = await Post.findById(postId);
            if (!post) {
              reject(new NotFoundError("Post not found"));
            } else {
              redisClientInstance
                .getClient(DEFAULT_CLIENT)
                .set(`post:${postId}`, JSON.stringify(post));
              resolve(post);
            }
          }
        });
    });
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
