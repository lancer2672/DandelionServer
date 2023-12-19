const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Credential:
 *       type: object
 *       required:
 *         - user
 *         - password
 *         - accessToken
 *         - refreshToken
 *         - refreshTokensUsed
 *         - emailVerificationCode
 *         - emailVerified
 *         - emailVerificationCodeExpires
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         accessToken:
 *           type: string
 *           description: The access token of the user.
 *         refreshToken:
 *           type: string
 *           description: The refresh token of the user.
 *         refreshTokensUsed:
 *           type: array
 *           items:
 *             type: string
 *           description: The refresh tokens used by the user.
 *         emailVerificationCode:
 *           type: string
 *           description: The email verification code of the user.
 *         emailVerified:
 *           type: boolean
 *           description: The email verification status of the user.
 *         emailVerificationCodeExpires:
 *           type: string
 *           format: date-time
 *           description: The expiration time of the email verification code.
 *       example:
 *         user: "60d0fe4f7439346e18c6343a"
 *         password: "hashedpassword"
 *         accessToken: "access-token"
 *         refreshToken: "refresh-token"
 *         refreshTokensUsed: ["refresh-token-used"]
 *         emailVerificationCode: "verification-code"
 *         emailVerified: false
 *         emailVerificationCodeExpires: "2023-12-05T08:39:32.000Z"
 */

const CredentialSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    refreshTokensUsed: [{ type: String }],
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
module.exports = mongoose.model("credientials", CredentialSchema);
