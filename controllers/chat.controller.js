const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.getChannels = async (req, res) => {
  try {
    const userId = req.userId;
    const channels = await Channel.find({ memberIds: { $in: [userId] } }).sort({
      lastUpdate: -1,
    });
    res.json({
      success: true,
      message: "success",
      data: { channels },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get channels" });
  }
};
exports.GetChannelMember = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    const memberIds = channel.memberIds;
    const members = await User.find({
      _id: { $in: memberIds, $ne: req.userId },
    }).select("-password");
    res.json({ success: true, data: { members } });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get members" });
  }
};

exports.getChannelMessages = async (req, res) => {
  const channelId = req.params.channelId;
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return res
      .status(404)
      .json({ success: false, message: "Channel not found" });
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
  res.json({
    success: true,
    message: "Get messages successfully",
    data: {
      messages:
        recentMessages.length == 0 ? [] : recentMessages[0].channelMessages,
    },
  });
};

exports.getLastMessage = async (req, res) => {
  const channelId = req.params.channelId;
  const channel = await Channel.findById(channelId);
  let lastMessage = null;
  if (channel.channelMessages.length > 0) {
    lastMessage = channel.channelMessages[0];
  }
  if (!channel) {
    return res
      .status(404)
      .json({ success: false, message: "Channel not found" });
  }
  res.json({
    success: true,
    data: {
      lastMessage,
      channelId,
    },
  });
};

exports.findOrCreateChannel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid information", errors: errors.array() });
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
    res.json({
      success: true,
      data: {
        channel,
      },
    });
  } catch (err) {
    console.error("Error finding or creating channel", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while finding or creating the channel",
    });
  }
};
