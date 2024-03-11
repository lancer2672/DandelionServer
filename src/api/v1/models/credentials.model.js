const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CredentialSchema = new Schema(
  {
    password: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    publicKey: {
      type: String,
    },
    privateKey: {
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
