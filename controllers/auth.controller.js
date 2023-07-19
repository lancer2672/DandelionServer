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
exports.Register = async (req, res) => {
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
    return res.status(400).json({ message: "Username already taken" });
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
        message: "Register successfully",
        data: { user: newUser },
      });
    }
  });
};

exports.Login = async (req, res) => {
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
          const token = jwt.sign(
            { userId: existUser.id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.status(200).json({
            message: "User logged in",
            data: { token: token, user: existUser },
          });
        } else {
          // password doesn't match
          res.status(401).json({ message: "Password is incorrect" });
        }
      });
    }
  } catch (err) {
    console.log("500");
    res.status(500).json({ message: "SERVER ERROR" });
  }
};
