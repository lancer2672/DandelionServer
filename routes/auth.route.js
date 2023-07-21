const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { body } = require("express-validator");

router.post(
  "/login",
  body("username").exists().withMessage("Username is missing"),
  body("password").exists().withMessage("Password is missing"),
  AuthController.login
);

router.post(
  "/register",
  body("username").exists().withMessage("Username is missing"),
  body("password").exists().withMessage("Password is missing"),
  body("email").exists().withMessage("Email is missing"),
  AuthController.register
);

router.post("/refreshToken", AuthController.refreshToken);

router.get("/", async (req, res) => {
  const userId = req.userId;
  const existUser = await User.findById(userId).select("-password");
  if (!existUser)
    return res.status(400).json({ success: false, message: "User not found" });
  res.json({ success: true, user: existUser });
});

module.exports = router;
