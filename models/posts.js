const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model

const PostSchema = new Schema(
  {
    description: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        createdAt: String,
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", PostSchema);
