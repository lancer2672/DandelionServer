const fs = require("fs");
const User = require("../models/users");

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const userToUpdate = {
      nickname: req.body.nickname || user.nickname,
      email: req.body.email || user.email,
      avatar: user.avatar,
      wallPaper: user.wallPaper,
    };

    console.log("req.file.filename", req.file.filename);
    if (req.file) {
      if (req.body.isWallpaper === "false") {
        userToUpdate.avatar.data = fs.readFileSync(
          `uploads/${req.file.filename}`
        );
      } else {
        userToUpdate.wallPaper.data = fs.readFileSync(
          `uploads/${req.file.filename}`
        );
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId },
      userToUpdate,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized or user not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot update user information" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;
    const users = await User.find({ username: new RegExp(keyword, "i") });
    return res.json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot get users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Cannot get user" });
  }
};
