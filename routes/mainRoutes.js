const routes = require("express").Router();

const authRouter = require("./auth");
const postRouter = require("./post");
const userRouter = require("./user");

routes.use("/api/auth", authRouter);
routes.use("/post", postRouter);
routes.use("/user", userRouter);

module.exports = routes;
