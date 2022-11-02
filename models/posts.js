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
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    reactionNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", PostSchema);
