const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { MessageSchema } = require("./message.model");

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
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    //If user A and B are not friend -> true
    isInWaitingList: {
      type: Boolean,
      default: false,
    },
    channelMessages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("channel", ChannelSchema);
