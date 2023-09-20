const fs = require("fs");
const User = require("../models/user");
const voximplantService = require("../services/voximplant");

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userToUpdate = {
      nickname: req.body.nickname || user.nickname,
      email: req.body.email || user.email,
      gender: req.body.gender || user.gender,
      phoneNumber: req.body.phoneNumber || user.phoneNumber,
      dateOfBirth: req.body.dateOfBirth || user.dateOfBirth,
      avatar: req.file ? req.file.path : user.avatar,
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId },
      userToUpdate,
      {
        new: true,
      }
    );
    const updatedVoximplantUser = {
      userDisplayName: req.body.nickname || user.nickname,
    };
    await voximplantService.setUserInfo(updatedVoximplantUser);
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
    const { q: keyword } = req.query;
    const users = await User.find({ nickname: new RegExp(keyword, "i") });

    const mappedUser1 = users.filter((user) => {
      //not get user of user itself
      if (user.toObject()._id != req.userId) {
        return user;
      }
    });
    const mappedUser2 = mappedUser1.map((user) => {
      const userObject = user.toObject();
      if (userObject._id != req.userId) {
        delete userObject.password;
        return userObject;
      }
    });
    return res.json({
      success: true,
      message: "Users fetched successfully",
      data: mappedUser2,
    });
  } catch (err) {
    console.log("err", err);
    return res
      .status(400)
      .json({ success: false, message: "Cannot get users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    return res.json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Cannot get user" });
  }
};

exports.getListUser = async (req, res) => {
  try {
    const listIds = req.body.listIds;
    const users = await User.find({ _id: { $in: listIds } }).select(
      "-password"
    );
    return res.json({
      success: true,
      message: "Users fetched successfully",
      data: { users },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot get users" });
  }
};

exports.saveFCMtoken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { token } = req.body;
    user.FCMtoken = token;
    await user.save();
    res.json({
      success: true,
      message: "save token success",
    });
  } catch (err) {
    console.log("error when save user's FCM token", err);
    res.json({
      success: false,
      message: "save token failed",
    });
  }
};

exports.getAllFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends.userId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const friends = user.friends.map((friend) => friend.userId);
    console.log("friends", friends);

    return res.json({
      success: true,
      message: "Friends fetched successfully",
      data: { friends },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot get friends" });
  }
};
