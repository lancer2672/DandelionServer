const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar: {
      data: Buffer,
      contentType: String,
    },
    wallPaper: {
      data: Buffer,
      contentType: String,
    },
    friends: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        createdAt: String,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("users", UserSchema);
