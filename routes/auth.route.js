const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const AuthController = require("../controllers/auth.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", errorHandler(AuthController.login));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", verifyToken, errorHandler(AuthController.logout));

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put(
  "/change-password",
  verifyToken,
  errorHandler(AuthController.changePassword)
);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login with Google successful
 */
router.post(
  "/google",
  verifyToken,
  errorHandler(AuthController.loginWithGoogle)
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post("/register", errorHandler(AuthController.register));

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post(
  "/refresh-token",
  verifyToken,
  errorHandler(AuthController.refreshToken)
);

/**
 * @swagger
 * /auth/send-email-verification:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email verification sent successfully
 */
router.post(
  "/send-email-verification",
  verifyToken,
  errorHandler(AuthController.sendEmailVerification)
);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get(
  "/verify-email",
  verifyToken,
  errorHandler(AuthController.verifyEmail)
);

/**
 * @swagger
 * /auth/reset-password:
 *   put:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.put(
  "/reset-password",
  verifyToken,
  errorHandler(AuthController.resetPassword)
);

module.exports = router;
