const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

class ChatService {
  static async getChannels(userId) {
    const channels = await Channel.find({ memberIds: { $in: [userId] } }).sort({
      lastUpdate: -1,
    });
    if (!channels) {
      throw new NotFoundError("Channels not found");
    }
    return channels;
  }

  static async getChannelMember(channelId, userId) {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }
    const memberIds = channel.memberIds;
    const members = await User.find({
      _id: { $in: memberIds, $ne: userId },
    }).select("-password");
    return members;
  }

  static async getChannelMessages(channelId) {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }
    const recentMessages = await Channel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(channelId) } },
      { $unwind: "$channelMessages" },
      { $sort: { "channelMessages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          channelMessages: { $push: "$channelMessages" },
        },
      },
      { $project: { _id: 0, channelMessages: 1 } },
    ]);
    return recentMessages.length == 0 ? [] : recentMessages[0].channelMessages;
  }

  static async getLastMessage(channelId) {
    const channel = await Channel.findById(channelId).lean();
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }
    let lastMessage = null;
    if (channel.channelMessages.length > 0) {
      lastMessage = channel.channelMessages[0];
    }
    return { lastMessage, channelId };
  }
  static async findOrCreateChannel(channelName = "", memberIds) {
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
    return channel;
  }
}

module.exports = ChatService;
