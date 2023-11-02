const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
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
