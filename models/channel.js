const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelSchema = new Schema(
  {
    channelName: {
      type: String,
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
    lastUpdate: {
      type: Date,
      default: Date.now,
    },

    //If user A and B are not friend -> true
    isInWaitingList: {
      type: Boolean,
      default: false,
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
        imageUrls: [
          {
            type: String,
          },
        ],
        isSeen: {
          type: Boolean,
          default: false,
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
