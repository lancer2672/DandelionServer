const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const voximplantService = require("../services/voximplant");
const { sendVerificationEmail } = require("../services/mailer");
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
  const { password, email, firstname, lastname, dateOfBirth } = req.body;
  const nickname = `${lastname} ${firstname}`;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
  }
  const existUser = await User.findOne({
    email: email.toLowerCase(),
    emailVerified: true,
  });
  if (existUser) {
    return res.status(400).json({ message: "Email is already taken" });
  }
  bcrypt.hash(password, 12, async (err, passwordHash) => {
    if (err) {
      return res
        .status(500)
        .json({ success: "false", message: "Couldn't hash the password" });
    } else if (passwordHash) {
      const newUser = new User({
        username: email.toLowerCase(),
        password: passwordHash,
        email: email.toLowerCase(),
        avatar: null,
        lastname,
        firstname,
        dateOfBirth,
        nickname,
      });
      try {
        await newUser.save();
      } catch (err) {
        console.log("err", err);
        return res
          .status(500)
          .json({ success: "false", message: "Couldn't create user" });
      }
      return res.json({
        success: "true",
        message: "Registered successfully",
        data: { user: newUser },
      });
    }
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
  }

  try {
    const existUser = await User.findOne({
      username: username.toLowerCase(),
      emailVerified: true,
    });
    if (!existUser) {
      return res.status(400).json({ message: "User does not exist" });
    } else {
      bcrypt.compare(password, existUser.password, (err, compareRes) => {
        if (err) {
          // error while comparing
          res
            .status(502)
            .json({ message: "Error while checking user's password" });
        } else if (compareRes) {
          // password match
          const accessToken = generateAccessToken(existUser._id);
          const refreshToken = generateRefreshToken(existUser._id);
          delete existUser.password;
          res.status(200).json({
            message: "User logged in successfully",
            data: { token: accessToken, refreshToken, user: existUser },
          });
        } else {
          // password doesn't match
          res.status(401).json({ message: "Incorrect password" });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: "SERVER ERROR" });
  }
};
exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const userId = decoded.userId;
    const newAccessToken = generateAccessToken(userId);
    res.status(200).json({ message: "success", accessToken: newAccessToken });
  });
};
exports.verifyEmail = async (req, res) => {
  try {
    const { code, password, isResetPassword } = req.query;
    console.log(code, password, isResetPassword);
    const user = await User.findOne({ emailVerificationCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.emailVerificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    if (JSON.parse(isResetPassword) == false) {
      await voximplantService.addUser({
        userName: user.email.split("@")[0].toLowerCase(),
        userDisplayName: user.nickname,
        userPassword: password,
      });
      user.emailVerified = true;
    }
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpires = null;

    await user.save();

    res.json({ success: true });
  } catch (er) {
    console.log("er", er);
    res.status(400).json({ message: "Failed" });
  }
};
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email, isResetPassword } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is empty" });
    }
    const code = generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: isResetPassword ? true : false,
    });

    if (!user) {
      console.log("cannot find user");
      return res.status(400).json({ message: "User does not exist" });
    }

    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = expires;
    await user.save();
    const result = await sendVerificationEmail(email, code);

    res.json({ data: {} });
  } catch (er) {
    console.log("er", er);
    res.status(400).json({ message: "Send email failed" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
  }
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: true,
    });
    bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
      if (err) {
        return res
          .status(500)
          .json({ success: "false", message: "Couldn't hash the password" });
      } else if (passwordHash) {
        user.password = passwordHash;
        try {
          await user.save();
        } catch (err) {
          console.log("err", err);
          return res
            .status(500)
            .json({ success: "false", message: "Couldn't update password" });
        }
        const updatedVoximplantUser = {
          userPassword: newPassword,
        };
        await voximplantService.setUserInfo(updatedVoximplantUser);
        user.emailVerificationCode = null;
        user.emailVerificationCodeExpires = null;
        return res.json({
          success: "true",
          message: "Password reset successfully",
          data: { user },
        });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "SERVER ERROR" });
  }
};
