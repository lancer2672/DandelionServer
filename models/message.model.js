const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ImageSchema, VideoSchema } = require("./media.model");

const MessageSchema = new Schema(
  {
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
module.exports = {
  MessageSchema,
  CallMessageSchema,
  TextMessageSchema,
  ImageMessageSchema,
  VideoMessageSchema,
};
