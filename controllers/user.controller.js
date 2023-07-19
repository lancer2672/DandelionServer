const fs = require("fs");
const User = require("../models/users");

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let updatedUser = {
      nickname: req.body.nickname || user.nickname,
      email: req.body.email || user.email,
      avatar: user.avatar,
      wallPaper: user.wallPaper,
    };
    if (req.file) {
      console.log("wallpaper", req.body.isWallpaper);
      if (req.body.isWallpaper == "false") {
        updatedUser.avatar.data = fs.readFileSync(
          `uploads/${req.file.filename}`
        );
        console.log("read");
      } else {
        updatedUser.wallPaper.data = fs.readFileSync(
          `uploads/${req.file.filename}`
        );
      }
    }
    result = await User.findOneAndUpdate({ _id: req.userId }, updatedUser, {
      new: true,
    });
    if (!result) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized or post not found ",
      });
    }

    res.json({
      success: true,
      message: "excellent progess",
      user: result,
      updatedUser,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "cannot update your information" });
  }
};

exports.searchUsers = (req, res) => {
  const keyword = req.query.q;
  User.find({ username: new RegExp(keyword, "i") }, function (err, users) {
    if (err)
      return res
        .status(400)
        .json({ sucess: false, message: "cannot get users" });
    return res.json({ sucess: true, message: "get users successfully", users });
  });
};

exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      return res.json({
        success: true,
        message: "get user successfully",
        user,
      });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ success: false, message: "cannot get user" });
    });
};

exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      return res.json({
        success: true,
        message: "get user successfully",
        user,
      });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ success: false, message: "cannot get user" });
    });
};

