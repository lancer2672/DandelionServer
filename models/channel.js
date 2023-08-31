const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelSchema = new Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    images: {
      data: Buffer,
      contentType: String,
    },
    channelMessages: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        message: {
          type: String,
          default: null,
        },
        imageUrl: {
          type: String,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("channel", ChannelSchema);
