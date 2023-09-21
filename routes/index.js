const routes = require("express").Router();

const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const uploadRoutes = require("./upload.route");
const friendRequestRoutes = require("./friend-request.route");
const notificationRoutes = require("./notification.route");

routes.use("/api/auth", authRoutes);
routes.use("/post", postRoutes);
routes.use("/user", userRoutes);
routes.use("/chat", chatRoutes);
routes.use("/friend-request", friendRequestRoutes);
routes.use("/notification", notificationRoutes);
routes.use("/upload", uploadRoutes);

module.exports = routes;
