const routes = require("express").Router();

const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const userRoutes = require("./user.route");
const channelRoutes = require("./channel.route");
const friendRequestRoutes = require("./friend-request.route");

routes.use("/api/auth", authRoutes);
routes.use("/post", postRoutes);
routes.use("/user", userRoutes);
routes.use("/channel", channelRoutes);
routes.use("/friend-requests", friendRequestRoutes);

module.exports = routes;
