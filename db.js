const mongoose = require("mongoose");
require("dotenv").config();
const { countConnect } = require("./helpers/checkConnect");

const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dandelion.bswdcrh.mongodb.net/?retryWrites=true&w=majority`;
class Database {
  constructor() {
    this.connect();
  }
  connect(type = "mongodb") {
    //dev env
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
      mongoose
        .connect(connectionString)
        .then((_) => {
          console.log("connected to DB");
        })
        .catch((er) => {
          console.log("can not connect to DB", er);
        });
    }
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const mongoDBInstance = Database.getInstance();
module.exports = mongoDBInstance;
