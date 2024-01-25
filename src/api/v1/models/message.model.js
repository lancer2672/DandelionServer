const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ImageSchema, VideoSchema } = require("./media.model");

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - isSeen
 *         - createdAt
 *         - attrs
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user who sent the message.
 *         channelId:
 *           type: string
 *           description: The ID of channel.
 *         type:
 *           type: string
 *           enum: [text, image, video, callHistory]
 *           description: The type of the message.
 *         isSeen:
 *           type: boolean
 *           description: Whether the message has been seen by the receiver.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the message.
 *         attrs:
 *           type: object
 *           description: The attributes of the message, depending on its type.
 *       example:
 *         userId: "60d0fe4f7439346e18c6343a"
 *         type: "text"
 *         isSeen: false
 *         createdAt: "2023-12-05T08:39:32.000Z"
 *         attrs: { message: "Hello, world!" }
 *     TextMessage:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             attrs:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The text of the message.
 *     ImageMessage:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             attrs:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Image'
 *     VideoMessage:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             attrs:
 *               type: object
 *               properties:
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *     CallMessage:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             attrs:
 *               type: object
 *               properties:
 *                 callHistory:
 *                   type: object
 *                   properties:
 *                     duration:
 *                       type: number
 *                       description: The duration of the call in seconds.
 */

const MessageSchema = new Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "channel",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    type: {
      type: String,
      default: "text",
      require: true,
      enum: ["text", "image", "video", "callHistory"],
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    attrs: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);
const TextMessageSchema = new Schema({
  message: {
    type: String,
    require: true,
  },
});

const ImageMessageSchema = new Schema({
  images: [ImageSchema],
});
const VideoMessageSchema = new Schema({
  videos: [VideoSchema],
});
const CallMessageSchema = new Schema({
  callHistory: {
    duration: {
      type: Number,
      default: 0,
      require: true,
    },
  },
});

const Message = mongoose.model("message", MessageSchema);

module.exports = {
  Message,
  CallMessageSchema,
  TextMessageSchema,
  ImageMessageSchema,
  VideoMessageSchema,
};
