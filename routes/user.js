const express = require("express");
const multer = require("multer");
const fs = require("fs");

const verifyToken = require("../middleware/veryfyToken");
const User = require("../models/users");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.put(
  "/:id",
  verifyToken,
  upload.single("userImage"),
  async (req, res) => {
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
          sucess: false,
          message: "You are not authorized or post not found ",
        });
      }

      res.json({
        sucess: true,
        message: "excellent progess",
        user: result,
        updatedUser,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ sucess: false, message: "cannot update your information" });
    }
  }
);

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).json({
        sucess: false,
        message: "cannot find user",
      });
    }
    res.json({ sucess: true, message: "get user successfully", user });
  } catch (err) {
    return res.status(400).json({ sucess: false, message: "cannot get user" });
  }
});

module.exports = router;
