const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
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
    gender: {
      type: Number,
      //0: male, 1:female
      enum: [0, 1],
      default: 0,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    avatar: {
      type: String,
    },
    FCMtoken: {
      type: String,
    },
    friends: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        createdAt: String,
      },
    ],
    isOnline: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    lastOnline: {
      type: Date,
      default: new Date(),
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCodeExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", UserSchema);
