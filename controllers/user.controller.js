const mongoose = require("mongoose");
const User = require("../models/user");
const SearchHistory = require("../models/search-history");
const voximplantService = require("../services/voximplant");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
  NotFoundError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

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
    const { nickname, email, gender, phoneNumber, dateOfBirth, avatar } =
      req.body;
    console.log("Avatar", avatar);
    const user = await User.findById(req.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userToUpdate = {
      nickname: nickname || user.nickname,
      email: email || user.email,
      gender: gender || user.gender,
      phoneNumber: phoneNumber || user.phoneNumber,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      avatar: avatar || user.avatar,
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
      throw new BadRequestError("Update user failed");
    }
    new OK({
      message: "Success",
      data: { user: updatedUser },
    }).send(res);
  } catch (err) {
    throw new InternalServerError("Cannot update user information");
  }
};

exports.addUserToSearchHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await SearchHistory.updateOne(
      { user: req.userId },
      { $push: { searchedUsers: { userId, searchTime: new Date() } } },
      { upsert: true }
    );
    new OK({
      message: "Success",
      data: {},
    }).send(res);
  } catch (err) {
    throw new InternalServerError("Cannot add user to search history");
  }
};

exports.removeUserFromSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await SearchHistory.updateOne(
      { user: req.userId, "searchedUsers.userId": userId },
      { $set: { "searchedUsers.$.deletedAt": new Date() } }
    );
    new OK({
      message: "Success",
      data: {},
    }).send(res);
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError("Cannot remove user from search history");
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
    new OK({
      message: "Success",
      data: mappedUser2,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
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

    new OK({
      message: "Success",
      data: users,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    new OK({
      message: "Success",
      data: { user },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getListUser = async (req, res) => {
  try {
    const listIds = req.body.listIds;
    const users = await User.find({ _id: { $in: listIds } }).select(
      "-password"
    );
    new OK({
      message: "Success",
      data: { users },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.saveFCMtoken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { token } = req.body;
    user.FCMtoken = token;
    await user.save();
    new OK({
      message: "Success",
      data: {},
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getAllFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends.userId");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const friends = user.friends.map((friend) => friend.userId);
    console.log("friends", friends);
    new OK({
      message: "Success",
      data: { friends },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};
