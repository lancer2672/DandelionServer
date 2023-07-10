const Channel = require("../models/channel");
const User = require("../models/users");
exports.getChannels = (req, res) => {
  const userId = req.userId;
  Channel.find({ usersId: { $in: [userId] } })
    .then((channels) => {
      res.json({
        success: true,
        message: "success",
        channels,
      });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "cannot get channels" })
    );
};

exports.GetChannelMember = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    const membersId = channel.membersId;
    const members = await User.find({ _id: { $ne: req.userId } });
    res.json({ success: true, members });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get members" });
  }
};

exports.getRecentMessages = async (req, res) => {
  const channelId = req.params.channelId;

  // Lấy 5 tin nhắn gần nhất từ kênh sử dụng aggregation
  const recentMessages = await Channel.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(channelId) } },
    { $unwind: "$channelMessages" }, // Tách các tin nhắn trong mảng channelMessages thành từng document riêng
    { $sort: { "channelMessages.createdAt": -1 } }, // Sắp xếp các tin nhắn theo thời gian tạo giảm dần
    { $limit: 7 }, // Giới hạn chỉ lấy 5 tin nhắn
    {
      $group: {
        _id: "$_id",
        channelMessages: { $push: "$channelMessages" }, // Gom lại các tin nhắn thành một mảng
      },
    },
    { $project: { _id: 0, channelMessages: 1 } }, // Chỉ lấy trường channelMessages và loại bỏ trường _id
  ]);

  if (recentMessages.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Channel not found" });
  }

  res.json({
    success: true,
    message: "Get recent messages successfully",
    recentMessages: recentMessages[0].channelMessages,
  });
};
