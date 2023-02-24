const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Tao model

const PostSchema = new Schema(
  {
    // title: {
    //     type:String,
    //     required: true
    // },
    creatorName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        createdAt: String,
      },
    ],
    comments: [
      {
        creatorName: String,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "users",
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
