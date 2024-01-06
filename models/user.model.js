const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ImageSchema, VideoSchema } = require("./media.model");
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nickname
 *         - firstname
 *         - lastname
 *         - email
 *         - gender
 *         - isOnline
 *         - lastOnline
 *       properties:
 *         nickname:
 *           type: string
 *           description: The nickname of the user.
 *         firstname:
 *           type: string
 *           description: The first name of the user.
 *         lastname:
 *           type: string
 *           description: The last name of the user.
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           description: The date of birth of the user.
 *         email:
 *           type: string
 *           description: The email of the user.
 *         gender:
 *           type: integer
 *           enum: [0, 1]
 *           description: The gender of the user. 0 for male, 1 for female.
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the user.
 *         avatar:
 *           $ref: '#/components/schemas/Image'
 *         FCMtoken:
 *           type: string
 *           description: The Firebase Cloud Messaging token of the user.
 *         friends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the friend.
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The time when the friendship was created.
 *         isOnline:
 *           type: integer
 *           enum: [0, 1]
 *           description: Whether the user is online. 0 for offline, 1 for online.
 *         lastOnline:
 *           type: string
 *           format: date-time
 *           description: The last time the user was online.
 *       example:
 *         nickname: "User One"
 *         firstname: "First"
 *         lastname: "Last"
 *         dateOfBirth: "2000-01-01T00:00:00.000Z"
 *         email: "user1@example.com"
 *         gender: 0
 *         phoneNumber: "1234567890"
 *         avatar: { name: "Avatar", url: "https://example.com/avatar.jpg" }
 *         FCMtoken: "fcm-token"
 *         friends: [{ userId: "60d0fe4f7439346e18c6343b", createdAt: "2023-12-05T08:39:32.000Z" }]
 *         isOnline: 1
 *         lastOnline: "2023-12-05T08:39:32.000Z"
 */

const UserSchema = new Schema(
  {
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
    },
    phoneNumber: {
      type: String,
    },
    avatar: ImageSchema,
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
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", UserSchema);
