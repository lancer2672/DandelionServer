const express = require("express");
const app = express();
const server = require("http").Server(app);
const socketIO = require("socket.io")(server);
const cors = require("cors");
require("dotenv").config();

const mainRoute = require("./routes");
const connectDB = require("./db");
const setupSocketIO = require("./socket");

connectDB();
app.use(express.json());
app.use(cors());
app.use("/", mainRoute);

setupSocketIO(socketIO);

server.listen(process.env.PORT, () => console.log(`server started`));
