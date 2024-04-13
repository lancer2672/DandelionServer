const router = require("express").Router();

const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const uploadRoutes = require("./upload.route");
const friendRequestRoutes = require("./friendrequest.route");
const notificationRoutes = require("./notification.route");
const checkApiKey = require("../../../middleware/checkApiKey");
const pushLogToDiscord = require("../../../middleware/pushDiscord");
const AuthController = require("../controllers/auth.controller");
const errorHandler = require("../../../middleware/errorHandler");
// const checkGatewayRequest = require("../../../middleware/checkGateway");

router.use(pushLogToDiscord);
// router.use(checkApiKey);

router.get(
  "/credential/:userId",
  errorHandler(AuthController.getCredentialByUserId)
);
//route for other services verify api key
router.get("/checkapikey", AuthController.checkApiKey);

router.use("/api/auth", authRoutes);

router.use("/post", postRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/friend-request", friendRequestRoutes);
router.use("/notification", notificationRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
