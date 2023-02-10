const routes = require("express").Router();

const authRouter = require("./auth");
const postRouter = require("./post");
const userRouter = require("./user");
const chatRouter = require("./chat");

routes.use("/api/auth", authRouter);
routes.use("/post", postRouter);
routes.use("/user", userRouter);
routes.use("/chat", chatRouter);
module.exports = routes;
