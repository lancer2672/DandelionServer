const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel.model");
const { Message } = require("../models/message.model");
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
const S3ClientIns = require("../../../external/s3Client");
const MessageRepository = require("../models/repositories/message.repo");
const ChannelRepository = require("../models/repositories/channel.repo");

class ChatService {
  static async getChannels({ userId, skip = 0, limit = 20 }) {
    const channels = await ChannelRepository.findChannels(
      { query: { memberIds: { $in: [userId] } } },
      skip,
      limit
    );

    if (!channels) {
      throw new NotFoundError("Channels not found");
    }
    console.log(">>>ChatService.getChannels", { channels });
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
  static async getChannelMessages(channelId, limit, skip) {
    const messages = await MessageRepository.getUserMessage({
      query: {
        channelId,
      },
      skip,
      limit,
    });

    return messages;
  }

  static async getLastMessage(channelId) {
    const lastMessage = await Message.findOne({
      channelId: channelId,
    }).sort({
      createdAt: -1,
    });
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
  static async updateUrl({ messageId, fileId }) {
    const newUrl = await S3ClientIns.getSignedUrl(fileId);
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }
    if (message.type === "video") {
      message.attrs.video.url = newUrl;
    }
    if (message.type === "image") {
      let updatedIndex = message.attrs.images.find(
        (img) => img.name === fileId
      );
      message.attrs.images[updatedIndex] = newUrl;
    }
    await message.save();
    return { url: newUrl };
  }
}

module.exports = ChatService;
