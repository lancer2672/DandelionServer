// import { builtinModules } from "module";
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const mainRoutes = require("./routes/mainRoutes");
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
const app = express();
app.use(express.json());
app.use(cors());

app.use("/", mainRoutes);

app.listen(process.env.PORT, () => console.log(`server started`));
