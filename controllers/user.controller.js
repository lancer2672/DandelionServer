const mongoose = require("mongoose");
const User = require("../models/user");
const SearchHistory = require("../models/search-history");
const voximplantService = require("../services/voximplant");

const getDistinctSearchedUsers = async (userId) => {
  const result = await SearchHistory.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $unwind: "$searchedUsers" },
    { $match: { "searchedUsers.deletedAt": { $exists: false } } },
    { $group: { _id: "$searchedUsers.userId" } },
    { $limit: 5 },
  ]);

  return result.map((item) => item._id);
};

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

exports.addUserToSearchHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await SearchHistory.updateOne(
      { user: req.userId },
      { $push: { searchedUsers: { userId, searchTime: new Date() } } },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: "User added to search history successfully",
    });
  } catch (err) {
    console.log("err", err);
    return res
      .status(400)
      .json({ success: false, message: "Cannot add user to search history" });
  }
};

exports.removeUserFromSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await SearchHistory.updateOne(
      { user: req.userId, "searchedUsers.userId": userId },
      { $set: { "searchedUsers.$.deletedAt": new Date() } }
    );

    return res.json({
      success: true,
      message: "User removed from search history successfully",
    });
  } catch (err) {
    console.log("err", err);
    return res.status(400).json({
      success: false,
      message: "Cannot remove user from search history",
    });
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

exports.getRecentSearchHistory = async (req, res) => {
  try {
    const searchHistory = await SearchHistory.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      { $unwind: "$searchedUsers" },
      { $match: { "searchedUsers.deletedAt": { $exists: false } } },
      {
        $group: {
          _id: "$searchedUsers.userId",
          lastSearchTime: { $max: "$searchedUsers.searchTime" },
        },
      },
      { $sort: { lastSearchTime: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { password: 0 } },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ]);

    const userIds = searchHistory.map((item) => item._id);
    const users = await User.find({ _id: { $in: userIds } });

    return res.json({
      success: true,
      message: "Recent search history fetched successfully",
      data: users,
    });
  } catch (err) {
    console.log("err", err);
    return res
      .status(400)
      .json({ success: false, message: "Cannot get recent search history" });
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
