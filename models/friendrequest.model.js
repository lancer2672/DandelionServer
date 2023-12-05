const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     FriendRequest:
 *       type: object
 *       required:
 *         - sender
 *         - receiver
 *         - status
 *         - isSeen
 *       properties:
 *         sender:
 *           type: string
 *           description: The ID of the user who sent the friend request.
 *         receiver:
 *           type: string
 *           description: The ID of the user who received the friend request.
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined]
 *           description: The status of the friend request.
 *         isSeen:
 *           type: boolean
 *           description: Whether the friend request has been seen by the receiver.
 *       example:
 *         sender: "60d0fe4f7439346e18c6343a"
 *         receiver: "60d0fe4f7439346e18c6343b"
 *         status: "pending"
 *         isSeen: false
 */

const FriendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("friendRequest", FriendRequestSchema);
