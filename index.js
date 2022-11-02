// import { builtinModules } from "module";

const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const User = require("./models/users");
const Post = require("./models/posts");
const verifyToken = require("./middleware/veryfyToken");
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/post", postRouter);

app.listen(process.env.PORT, () => console.log(`server started`));
