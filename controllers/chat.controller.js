const Channel = require("../models/channel");
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
