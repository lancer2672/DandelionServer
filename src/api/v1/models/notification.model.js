const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - description
 *         - title
 *         - isSeen
 *         - senderIds
 *         - receiverId
 *         - postId
 *         - deletedAt
 *       properties:
 *         description:
 *           type: string
 *           description: The description of the notification.
 *         title:
 *           type: string
 *           description: The title of the notification.
 *         isSeen:
 *           type: boolean
 *           description: Whether the notification has been seen by the receiver.
 *         senderIds:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user who sent the notification.
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The creation time of the notification.
 *         receiverId:
 *           type: string
 *           description: The ID of the user who received the notification.
 *         postId:
 *           type: string
 *           description: The ID of the post related to the notification.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: The deletion time of the notification.
 *       example:
 *         description: "User A commented on your post."
 *         title: "New Comment"
 *         isSeen: false
 *         senderIds: [{ userId: "60d0fe4f7439346e18c6343a", createdAt: "2023-12-05T08:39:32.000Z" }]
 *         receiverId: "60d0fe4f7439346e18c6343b"
 *         postId: "60d0fe4f7439346e18c6343c"
 *         deletedAt: null
 */

const NotificationSchema = new Schema(
  {
    description: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      default: "",
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    senderIds: [
      {
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
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", NotificationSchema);
