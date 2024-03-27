const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const {
  OK,
  CreatedResponse,
} = require("../../../classes/success/SuccessResponse");

const ChatService = require("../services/chat.service");

exports.getChannels = async (req, res) => {
  try {
    const channels = await ChatService.getChannels(req.userId);
    new OK({
      message: "Success",
      data: { channels },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.GetChannelMember = async (req, res) => {
  try {
    const members = await ChatService.getChannelMember(
      req.params.channelId,
      req.userId
    );
    new OK({
      message: "Success",
      data: { members },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getChannelMessages = async (req, res) => {
  try {
    const { limit, skip = 0 } = req.query;
    const messages = await ChatService.getChannelMessages(
      req.params.channelId,
      limit,
      skip
    );
    new OK({
      message: "Success",
      data: { messages },
    }).send(res);
  } catch (err) {
    console.log("error", err);
    throw new InternalServerError();
  }
};

exports.getLastMessage = async (req, res) => {
  try {
    const { lastMessage, channelId } = await ChatService.getLastMessage(
      req.params.channelId
    );
    new OK({
      message: "Success",
      data: { lastMessage, channelId },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.findOrCreateChannel = async (req, res) => {
  try {
    const { channelName = "", memberIds } = req.body;
    const channel = await ChatService.findOrCreateChannel(
      channelName,
      memberIds
    );
    new OK({
      message: "Success",
      data: { channel },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};
