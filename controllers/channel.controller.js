const { default: mongoose } = require("mongoose");
const Channel = require("../models/channel");
const User = require("../models/users");

const findOrCreateChannelAndAddUser = async (userId, channelId) => {
  try {
    let channel;

    if (channelId) {
      channel = await Channel.findById(channelId);
    }

    if (!channel) {
      const channelName = `New Channel`;
      channel = new Channel({
        channelName,
        membersId: [userId],
        channelMessages: [],
      });
      await channel.save();
      console.log("Channel created successfully!");
    } else {
      if (!channel.membersId.includes(userId)) {
        channel.membersId.push(userId);
        await channel.save();
        console.log("User added to the channel!");
      } else {
        console.log("User already exists in the channel!");
      }
    }
  } catch (err) {
    console.error("Error finding/creating channel:", err);
  }
};
exports.getChannels = (req, res) => {
  const userId = req.userId;
  Channel.find({ usersId: { $in: [userId] } })
    .then((channels) => {
      res.json({
        success: true,
        message: "success",
        data: { channels },
      });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "cannot get channels" })
    );
};

exports.GetChannelMember = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    const membersId = channel.membersId;
    console.log("req.", req.userId);
    const members = await User.find({ _id: { $ne: req.userId } });
    res.json({ success: true, data: { members } });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get members" });
  }
};
exports.getRecentMessages = async (req, res) => {
  const channelId = req.params.channelId;
  console.log("Channel", channelId);

  const channel = await Channel.findOne({
    _id: mongoose.Types.ObjectId(channelId),
  });

  if (!channel) {
    return res
      .status(404)
      .json({ success: false, message: "Channel not found" });
  }

  // Lấy 5 tin nhắn gần nhất từ kênh sử dụng aggregation
  const recentMessages = await Channel.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(channelId) } },
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
    message: "Get recent messages successfully",
    data: {
      messages:
        recentMessages.length == 0 ? [] : recentMessages[0].channelMessages,
    },
  });
};
