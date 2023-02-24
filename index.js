// import { builtinModules } from "module";
const express = require("express");
const app = express();
const server = require("http").Server(app);
const socketIO = require("socket.io")(server);
const mongoose = require("mongoose");
const cors = require("cors");
const ObjectId = mongoose.Types.ObjectId;
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
const ChatChannel = require("./models/channel");
let chatChannels = [];
socketIO.on("connection", (socket) => {
  console.log("a user just connected", socket.id);
  socket.on("create-channel", (roomName) => {
    console.log("creating channel", roomName);
  });
  socket.on("join-chat-room", (channelId) => {
    console.log("join ");
    socket.join(channelId);
  });
  socket.on("send-message", async ({ channelId, userId, newMessage }) => {
    const chatChannels = await ChatChannel.findById(channelId);
    const lastItem = chatChannels.channelMessages.slice(-1)[0];

    //check if message of channel is empty
    if (lastItem) {
      //check if there is already a messageBox of user send message
      if (lastItem.userId == userId) {
        chatChannels.channelMessages.slice(-1)[0].messageBox.unshift({
          _id: new ObjectId(),
          message: newMessage,
          createdAt: new Date(),
        });
      } else {
        chatChannels.channelMessages.unshift({
          _id: new ObjectId(),
          userId: userId,
          messageBox: [
            {
              _id: new ObjectId(),
              message: newMessage,
              createdAt: new Date(),
            },
          ],
        });
      }
    } else {
      chatChannels.channelMessages.unshift({
        _id: new ObjectId(),
        userId: userId,
        messageBox: [
          {
            _id: new ObjectId(),
            message: newMessage,
            createdAt: new Date(),
          },
        ],
      });
    }
    chatChannels.save();
    socket.emit("updated-channels", chatChannels);
    // socket.to(channelId).emit("updated-channels", chatChannels);
  });
  socket.on("login", async (userId) => {
    const chatChannels = await ChatChannel.find({ usersId: { $in: [userId] } });
    socket.emit("get-channels", chatChannels);
  });
});
server.listen(process.env.PORT, () => console.log(`server started`));
