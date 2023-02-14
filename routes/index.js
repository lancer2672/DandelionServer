const routes = require("express").Router();

const authRouter = require("./auth.route");
const postRouter = require("./post.route");
const userRouter = require("./user.route");
const chatRouter = require("./chat.route");

routes.use("/api/auth", authRouter);
routes.use("/post", postRouter);
routes.use("/user", userRouter);
routes.use("/chat", chatRouter);
module.exports = routes;
