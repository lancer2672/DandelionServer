const express = require("express");
const router = express.Router();
const Channel = require("./../models/channel");
const verifyToken = require("./../middleware/veryfyToken");

router.get("/channel/", verifyToken, (req, res) => {
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
});

module.exports = router;
