const express = require("express");
process.on("warning", (e) => console.warn(e.stack));
const app = express();
const server = require("http").Server(app);
const socketIO = require("socket.io")(server);
const setUpSocket = require("./socket/index");
const Global = require("./socket/global");
setUpSocket(socketIO);
Global.socketIO = socketIO;
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const mainRoute = require("./routes");
const path = require("path");

connectDB();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", mainRoute);
server.listen(process.env.PORT, () => console.log(`server started`));
