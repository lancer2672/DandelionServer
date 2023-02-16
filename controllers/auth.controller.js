const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Channel = require("../models/channel");

const CreateChatChannels = (newUser, existedUsers) => {
  console.log("existedUsers", existedUsers.length);
  let channels = [];
  for (let i = 0; i < existedUsers.length; i++) {
    channels.unshift({
      channelName: "",
      usersId: [newUser._id, existedUsers[i]._id],
      messages: [],
    });
  }
  Channel.insertMany(channels, (err) => console.log(err));
};

exports.Register = async (req, res) => {
  const { username, password, email } = req.body;
  if (!username) {
    return res.status(400).json({ message: "username is missing" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is missing" });
  }
  if (!email) {
    return res.status(400).json({ message: "email is missing" });
  } else {
    const existUser = await User.findOne({ username });
    if (existUser) {
      return res.status(400).json({ message: "username already taken" });
    }
    bcrypt.hash(password, 12, async (err, passwordHash) => {
      if (err) {
        return res
          .status(500)
          .json({ success: "false", message: "couldn't harsh the password" });
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
          nickname: username,
        });
        try {
          await newUser.save();
          User.find({}, (error, users) => {
            if (error) {
              throw error;
            } else {
              CreateChatChannels(newUser, users);
            }
          });
        } catch (err) {
          return res
            .status(500)
            .json({ success: "false", message: "couldnt create user" });
        }
        return res.json({
          success: "true",
          message: "register successfully",
          user: newUser,
        });
      }
    });
  }
};

exports.Login = async (req, res) => {
  console.log("login");
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "username is missing" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is missing" });
  }
  try {
    const existUser = await User.findOne({ username });

    if (!existUser) {
      return res.status(400).json({ message: "user do not exist" });
    } else {
      bcrypt.compare(password, existUser.password, (err, compareRes) => {
        if (err) {
          // error while comparing
          res
            .status(502)
            .json({ message: "error while checking user's password" });
        } else if (compareRes) {
          // password match
          const token = jwt.sign(
            { userId: existUser.id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res
            .status(200)
            .json({ message: "user logged in", token: token, user: existUser });
        } else {
          // password doesnt match
          res.status(401).json({ message: "password is incorrect" });
        }
      });
    }
  } catch (err) {
    console.log("500");
    res.status(500).json({ message: "SERVER ERROR" });
  }
};
