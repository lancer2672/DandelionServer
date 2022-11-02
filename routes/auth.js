const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {
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
            .json({ message: "error while checking user password" });
        } else if (compareRes) {
          // password match
          const token = jwt.sign(
            { userId: existUser.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
          );

          // const token = jwt.sign({ userId: existUser.id }, process.env.ACCESS_TOKEN_SECRET);
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
});

router.post("/register", async (req, res) => {
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
          .json({ success: "false", message: "couldnt hash the password" });
      } else if (passwordHash) {
        const newUser = new User({
          username,
          password: passwordHash,
          email,
          nickname: username,
        });
        try {
          await newUser.save();
        } catch (err) {
          return res
            .status(500)
            .json({ success: "false", message: "couldnt create user" });
        }
        return res.json({
          success: "true",
          message: "register successfully",
          username,
          password,
          email,
        });
      }
    });
  }
});

//check if user existed
router.get("/", async (req, res) => {
  const userId = req.userId;
  const existUser = await User.findById(userId).select("-password");
  if (!existUser)
    return res.status(400).json({ success: false, message: "user not found" });
  res.json({ success: true, user: existUser });
});
module.exports = router;
