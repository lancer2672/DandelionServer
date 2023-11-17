const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");
const errorHandler = require("../middleware/errorHandler");

const { body } = require("express-validator");

router.post(
  "/login",
  body("email").exists().withMessage("email is missing"),
  body("password").exists().withMessage("password is missing"),
  errorHandler(AuthController.login)
);
router.post("/logout", errorHandler(AuthController.logout));
router.put(
  "/change-password",
  verifyToken,
  body("currentPassword").exists().withMessage("currentPassword is missing"),
  body("newPassword").exists().withMessage("newPassword is missing"),
  errorHandler(AuthController.changePassword)
);

router.post("/google", AuthController.loginWithGoogle);

router.post(
  "/register",
  body("password").exists().withMessage("password is missing"),
  body("email").exists().withMessage("email is missing"),
  errorHandler(AuthController.register)
);

router.post("/refresh-token", errorHandler(AuthController.refreshToken));

router.post(
  "/send-email-verification",
  errorHandler(AuthController.sendEmailVerification)
);
router.get("/verify-email", errorHandler(AuthController.verifyEmail));
router.put(
  "/reset-password",
  body("newPassword").exists().withMessage("newPassword is missing"),
  body("currentPassword").exists().withMessage("currentPassword is missing"),
  errorHandler(AuthController.resetPassword)
);

module.exports = router;
