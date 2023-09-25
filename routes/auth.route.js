const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { body } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");

router.post(
  "/login",
  body("username").exists().withMessage("username is missing"),
  body("password").exists().withMessage("password is missing"),
  AuthController.login
);

router.put(
  "/change-password",
  verifyToken,
  body("currentPassword").exists().withMessage("currentPassword is missing"),
  body("newPassword").exists().withMessage("newPassword is missing"),
  AuthController.changePassword
);

router.post("/google", AuthController.loginWithGoogle);

router.post(
  "/register",
  body("password").exists().withMessage("password is missing"),
  body("email").exists().withMessage("email is missing"),
  AuthController.register
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/send-email-verification", AuthController.sendEmailVerification);
router.get("/verify-email", AuthController.verifyEmail);
router.put(
  "/reset-password",
  body("newPassword").exists().withMessage("newPassword is missing"),
  body("currentPassword").exists().withMessage("currentPassword is missing"),
  AuthController.resetPassword
);

module.exports = router;
