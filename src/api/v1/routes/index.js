const router = require("express").Router();

const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const uploadRoutes = require("./upload.route");
const friendRequestRoutes = require("./friendrequest.route");
const notificationRoutes = require("./notification.route");
const checkApiKey = require("../../../middleware/checkApiKey");
const checkPermission = require("../../../middleware/checkPermission");
const pushLogToDiscord = require("../../../middleware/pushDiscord");

router.use(pushLogToDiscord);
//check api key
router.use(checkApiKey);
//default permssion
// router.use(checkPermission("0"));

router.use("/api/auth", authRoutes);

router.use("/post", postRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/friend-request", friendRequestRoutes);
router.use("/notification", notificationRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
