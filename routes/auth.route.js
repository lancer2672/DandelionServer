const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
router.post("/login", AuthController.Login);

router.post("/register", AuthController.Register);

//check if user existed

router.get("/", async (req, res) => {
  const userId = req.userId;
  const existUser = await User.findById(userId).select("-password");
  if (!existUser)
    return res.status(400).json({ success: false, message: "user not found" });
  res.json({ success: true, user: existUser });
});
module.exports = router;
