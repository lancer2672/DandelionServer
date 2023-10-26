const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.getChannels = async (req, res) => {
  try {
    const userId = req.userId;
    const channels = await Channel.find({ memberIds: { $in: [userId] } }).sort({
      lastUpdate: -1,
    });
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
    const channel = await Channel.findById(req.params.channelId);
    const memberIds = channel.memberIds;
    const members = await User.find({
      _id: { $in: memberIds, $ne: req.userId },
    }).select("-password");
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
    const channelId = req.params.channelId;
    const channel = await Channel.findById(channelId);

    if (!channel) {
      throw new NotFoundError("Channel not found");
    }

    const recentMessages = await Channel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(channelId) } },
      //get data from channelMessages property
      { $unwind: "$channelMessages" },
      { $sort: { "channelMessages.createdAt": -1 } },
      // { $limit: 7 },
      {
        $group: {
          _id: "$_id",
          channelMessages: { $push: "$channelMessages" },
        },
      },
      { $project: { _id: 0, channelMessages: 1 } },
    ]);
    new OK({
      message: "Success",
      data: {
        messages:
          recentMessages.length == 0 ? [] : recentMessages[0].channelMessages,
      },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.getLastMessage = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const channel = await Channel.findById(channelId);
    let lastMessage = null;
    if (channel.channelMessages.length > 0) {
      lastMessage = channel.channelMessages[0];
    }
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }
    new OK({
      message: "Success",
      data: {
        lastMessage,
        channelId,
      },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.findOrCreateChannel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new NotFoundError("Channel not found");
  }
  const { channelName = "", memberIds } = req.body;
  try {
    let channel = await Channel.findOne({ memberIds: { $all: memberIds } });
    if (!channel) {
      channel = new Channel({
        channelName,
        memberIds,
        channelMessages: [],
        isInWaitingList: true,
      });
      await channel.save();
    }
    new OK({
      message: "Success",
      data: {
        channel,
      },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};
