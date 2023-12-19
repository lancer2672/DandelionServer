const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const { sendVerificationEmail } = require("../mailer");
const AccessService = require("../services/access.service");
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
function generateVerificationCode() {
  return Math.floor(Math.random() * 900000) + 100000;
}

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    const newUser = await AccessService.register(req.body);
    new CreatedResponse({
      message: "Register successfully",
      data: { user: newUser },
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  try {
    const loginData = await AccessService.login(req.body);
    new OK({
      message: "User logged in successfully",
      data: loginData,
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.loginWithGoogle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    const loginData = await AccessService.loginWithGoogle(req.body);
    new OK({
      message: "User logged in successfully",
      data: loginData,
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.refreshToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    const newAccessToken = await AccessService.refreshToken(req.body);
    new OK({
      message: "success",
      data: { accessToken: newAccessToken },
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.verifyEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    await AccessService.verifyEmail(req.query);
    new OK({}).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.sendEmailVerification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    await AccessService.sendEmailVerification(req.body);
    new OK({}).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    const user = await AccessService.resetPassword(req.body);
    new OK({
      message: "Password reset successfully",
      data: { user },
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};
exports.logout = async (req, res) => {
  const user = await User.findById(req.userId);
  const credential = await Credential.findOne({ user: user._id });

  if (!credential) {
    throw new BadRequestError();
  }

  credential.refreshTokensUsed.push(credential.refreshToken);
  credential.refreshToken = null;
  credential.accessToken = null;

  await credential.save();

  new OK({
    message: "Logout successfully",
    data: {},
  }).send(res);
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const user = await User.findById(req.userId);
  const credential = await Credential.findOne({ user: user._id });

  const isMatch = await bcrypt.compare(currentPassword, credential.password);

  if (!isMatch) {
    throw new BadRequestError("Password is incorrect");
  }

  bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
    if (err) {
      throw new InternalServerError("Hash password failed");
    } else if (passwordHash) {
      credential.password = passwordHash;

      try {
        await credential.save();
      } catch (err) {
        throw new InternalServerError("Update password failed");
      }

      new OK({
        message: "Password changed successfully",
        data: { user },
      }).send(res);
    }
  });
};
