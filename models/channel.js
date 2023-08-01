const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model

const ChannelSchema = new Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    membersId: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
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
          ref: "users",
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
