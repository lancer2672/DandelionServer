const express = require("express");
const AuthController = require("../controllers/auth.controller");
const errorHandler = require("../../../middleware/errorHandler");
const verifyAuthentication = require("../../../middleware/verifyAuthentication");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 */
/**
/** 
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     description: Login to the application
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: Email to use for login.
 *             password:
 *               type: string
 *               description: User's password.
 *     responses:
 *       200:
 *         description: Login successful
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: The access token.
 *             refreshToken:
 *               type: string
 *               description: The refresh token.
 *             user:
 *               $ref: '#/definitions/User'
 *       400:
 *         description: Incorrect information
 *       404:
 *         description: User does not exist or has not been verified
 */
router.post("/login", errorHandler(AuthController.login));

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
 * /auth/send-email-verification:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email verification sent successfully
 */
router.post(
  "/send-email-verification",

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

  errorHandler(AuthController.verifyEmail)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.use(verifyAuthentication);
router.post("/logout", errorHandler(AuthController.logout));

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
  errorHandler(AuthController.loginWithGoogle)
);
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
  errorHandler(AuthController.refreshToken)
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
  errorHandler(AuthController.resetPassword)
);

module.exports = router;
