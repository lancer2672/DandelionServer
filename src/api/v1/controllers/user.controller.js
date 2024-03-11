const mongoose = require("mongoose");
const User = require("../models/user.model");
const SearchHistory = require("../models/searchhistory.model");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
  NotFoundError,
} = require("../../../classes/error/ErrorResponse");
const {
  OK,
  CreatedResponse,
} = require("../../../classes/success/SuccessResponse");
const UserService = require("../services/user.service");

exports.updateUser = async (req, res) => {
  try {
    const { nickname, email, gender, phoneNumber, dateOfBirth, avatar } =
      req.body;
    console.log("Avatar", avatar);

    const userToUpdate = {
      nickname,
      email,
      gender,
      phoneNumber,
      dateOfBirth,
      avatar,
    };

    const updatedUser = await UserService.updateUser(req.userId, userToUpdate);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    new OK({
      data: { user: updatedUser },
    }).send(res);
  } catch (err) {
    console.error("Error updating user:", err);
    throw new InternalServerError("Error updating user");
  }
};

exports.addUserToSearchHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    await UserService.addUserToSearchHistory(req.userId, userId);
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
    await UserService.removeUserFromSearchHistory(req.userId, userId);
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
    const users = await UserService.searchUsers(keyword, req.userId);
    new OK({
      message: "Success",
      data: users,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getRecentSearchHistory = async (req, res) => {
  try {
    const users = await UserService.getRecentSearchHistory(req.userId);
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
    console.log(">>>getUserById", req.params.id);
    const user = await UserService.getUserById(req.params.id);
    new OK({
      message: "Success",
      data: user,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getListUser = async (req, res) => {
  try {
    const listIds = req.body.listIds;
    const users = await UserService.getListUser(listIds);
    new OK({
      message: "Success",
      data: users,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.saveFCMtoken = async (req, res) => {
  try {
    const { token } = req.body;
    console.log("saveFCM TOKEN", { token, userId: req.userId });
    await UserService.saveFCMtoken(req.userId, token);
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
    const friends = await UserService.getAllFriends(req.userId);
    new OK({
      message: "Success",
      data: friends,
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};
