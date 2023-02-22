const Channel = require("../models/channel");
const User = require("../models/users");
exports.GetChannels = (req, res) => {
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

exports.GetGroupMembers = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    const membersId = channel.membersId;
    const members = await User.find({ _id: { $ne: req.userId } });
    res.json({ success: true, members });
  } catch (err) {
    res.status(400).json({ success: false, message: "cannot get members" });
  }
};
