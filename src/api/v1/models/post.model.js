const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ImageSchema } = require("./media.model");
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *         - createdAt
 *         - replies
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user who made the comment.
 *         content:
 *           type: string
 *           description: The content of the comment.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the comment.
 *         replies:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the reply.
 *               userId:
 *                 type: string
 *                 description: The ID of the user who made the reply.
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The creation time of the reply.
 *       example:
 *         userId: "60d0fe4f7439346e18c6343a"
 *         content: "This is a comment."
 *         createdAt: "2023-12-05T08:39:32.000Z"
 *         replies: [{ content: "This is a reply.", userId: "60d0fe4f7439346e18c6343b", createdAt: "2023-12-05T08:39:32.000Z" }]
 *     Post:
 *       type: object
 *       required:
 *         - description
 *         - image
 *         - user
 *         - likes
 *         - comments
 *       properties:
 *         description:
 *           type: string
 *           description: The description of the post.
 *         image:
 *           $ref: '#/components/schemas/Image'
 *         user:
 *           type: string
 *           description: The ID of the user who made the post.
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user who liked the post.
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The time when the user liked the post.
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *       example:
 *         description: "This is a post."
 *         image: { name: "Image 1", url: "https://example.com/image1.jpg" }
 *         user: "60d0fe4f7439346e18c6343a"
 *         likes: [{ userId: "60d0fe4f7439346e18c6343b", createdAt: "2023-12-05T08:39:32.000Z" }]
 *         comments: [{ userId: "60d0fe4f7439346e18c6343b", content: "This is a comment.", createdAt: "2023-12-05T08:39:32.000Z", replies: [] }]
 */

const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      content: String,
      userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});
const PostSchema = new Schema(
  {
    description: {
      type: String,
      default: null,
    },
    image: ImageSchema,

    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        createdAt: String,
      },
    ],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", PostSchema);
