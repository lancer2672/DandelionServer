const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const setUpSocket = require("./socket/index");
const Global = require("./socket/global");
const mongoDBInstance = require("./db");
const mainRoute = require("./routes");

dotenv.config();

const app = express();
const server = http.Server(app);
const socketIOServer = socketIO(server);

setUpSocket(socketIOServer);
Global.socketIO = socketIOServer;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
