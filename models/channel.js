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
        _id: Schema.Types.ObjectId,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        messageBox: [
          {
            _id: Schema.Types.ObjectId,
            message: {
              type: String,
              createdAt: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("channel", ChannelSchema);
