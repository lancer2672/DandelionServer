const express = require("express");
const app = express();
// const server = require("http").Server(app);
// const socketIO = require("socket.io")(server);
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const { setUpServer, getServer } = require("./socket/config");
const mainRoute = require("./routes");

setUpServer(app);
const path = require("path");

connectDB();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", mainRoute);

getServer().listen(process.env.PORT, () => console.log(`server started`));
