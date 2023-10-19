const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const setUpSocket = require("./socket/index");
const Global = require("./socket/global");
const connectDB = require("./db");
const mainRoute = require("./routes");

dotenv.config();
connectDB();

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
