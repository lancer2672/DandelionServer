const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model

const ChannelSchema = new Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    usersId: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    images: {
      data: Buffer,
      contentType: String,
    },
    messages: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        content: String,
        createdAt: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("channel", ChannelSchema);
