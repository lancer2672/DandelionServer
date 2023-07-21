const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Channel = require("../models/channel");
const { validationResult } = require("express-validator");

const CreateChatChannels = (newUser, existedUsers) => {
  let channels = [];
  for (let i = 0; i < existedUsers.length; i++) {
    channels.unshift({
      channelName: `${existedUsers[i].nickname}`,
      membersId: [newUser._id, existedUsers[i]._id],
      channelMessages: [],
    });
  }
  Channel.insertMany(channels, (err) => console.log(err));
};
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Thời gian hết hạn của Access Token
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Thời gian hết hạn của Refresh Token
  });
};
exports.register = async (req, res) => {
  const { username, password, email, firstname, lastname, dateOfBirth } =
    req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
  }
  const existUser = await User.findOne({ username });
  if (existUser) {
    return res.status(400).json({ message: "Username is already taken" });
  }
  bcrypt.hash(password, 12, async (err, passwordHash) => {
    if (err) {
      return res
        .status(500)
        .json({ success: "false", message: "Couldn't hash the password" });
    } else if (passwordHash) {
      const newUser = new User({
        username,
        password: passwordHash,
        email,
        avatar: {
          data: "",
        },
        wallPaper: {
          data: "",
        },
        lastname,
        firstname,
        dateOfBirth,
        nickname: `${lastname} ${firstname}`,
      });
      try {
        await newUser.save();
        User.find({ _id: { $ne: newUser._id } }, (error, users) => {
          if (error) {
            throw error;
          } else {
            CreateChatChannels(newUser, users);
          }
        });
      } catch (err) {
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
    const existUser = await User.findOne({ username });

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
    console.log("500");
    res.status(500).json({ message: "SERVER ERROR" });
  }
};

// Controller cho việc refresh token
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
    console.log("newtoken", newAccessToken);
    res.status(200).json({ message: "success", accessToken: newAccessToken });
  });
};
