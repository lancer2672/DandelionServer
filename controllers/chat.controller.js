const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel");
const User = require("../models/user");

exports.getChannels = async (req, res) => {
  try {
    const userId = req.userId;
    const channels = await Channel.find({ memberIds: { $in: [userId] } });
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
  console.log("Channel", channelId);

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
  console.log("Channel", channelId);

  const channel = await Channel.findById(channelId);

  if (!channel) {
    return res
      .status(404)
      .json({ success: false, message: "Channel not found" });
  }
  res.json({
    success: true,
    data: {
      lastMessage: channel.channelMessages[0],
      channelId,
    },
  });
};
