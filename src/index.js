const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

//dbInstance
require("./db");
//logger
require("./logger/discord.log");


const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const server = http.Server(app);
//socket
const setUpSocket = require("./socket/index");
const Global = require("./socket/global");
const socketIOServer = socketIO(server);
setUpSocket(socketIOServer);
Global.socketIO = socketIOServer;

//swagger
const setupSwagger = require("./config/swagger");
setupSwagger(app);

const mainRoute = require("./api/v1/routes");

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(
  "/upload/images",
  express.static(path.join(__dirname, "/upload/images"))
);
app.use(
  "/upload/videos",
  express.static(path.join(__dirname, "upload/videos"))
);
app.use("/", mainRoute);
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
