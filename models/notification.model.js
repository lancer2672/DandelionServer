const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model

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
