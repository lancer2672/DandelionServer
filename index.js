// import { builtinModules } from "module";
const express = require("express");
const app = express();
const server = require("http").Server(app);
const socketIO = require("socket.io")(server);
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const mainRoute = require("./routes");
function connectDB() {
  try {
    mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dandelion.bswdcrh.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log("connected to DB");
  } catch (err) {
    console.log("can not connect to DB");
  }
}

connectDB();

app.use(express.json());
app.use(cors());
app.use("/", mainRoute);

//for chatting feature
const generateID = () => Math.random().toString(36).substring(2, 10);
let chatChannels = [
  {
    _id: 1,
    roomName: "RoomName",
    messages: [],
  },
];
socketIO.on("connection", (socket) => {
  console.log("a user just connected", socket.id);
  socket.on("create-channel", (roomName) => {
    console.log("creating channel", roomName);
  });
  socket.on("send-message", (newMessage) => {
    console.log("new message", newMessage);
  });
  socket.emit("get-channel-list", chatChannels);
});
server.listen(process.env.PORT, () => console.log(`server started`));
