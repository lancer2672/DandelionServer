const mongoose = require("mongoose");

const { countConnect } = require("./helpers/checkConnect");
const config = require("./config/appConfig");
const { Permission, Role } = require("./api/v1/models/role.model");
const apikeyModel = require("./api/v1/models/apikey.model");

const connectionString = `mongodb+srv://${config.db.user_name}:${config.db.password}@dandelion.bswdcrh.mongodb.net/?retryWrites=true&w=majority`;
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

async function createRolesAndApiKeys() {
  const readPostsPermission = new Permission({ read: ["posts"] });
  const writePostsPermission = new Permission({ write: ["posts"] });
  const deletePostsPermission = new Permission({ delete: ["posts"] });

  await Promise.all([
    readPostsPermission.save(),
    writePostsPermission.save(),
    deletePostsPermission.save(),
  ]);

  const userRole = new Role({
    name: "user",
    permissions: readPostsPermission._id,
  });

  const editorRole = new Role({
    name: "editor",
    permissions: writePostsPermission._id,
    child: userRole._id,
  });

  const adminRole = new Role({
    name: "admin",
    permissions: deletePostsPermission._id,
    child: editorRole._id,
  });

  await Promise.all([userRole.save(), editorRole.save(), adminRole.save()]);

  const userApiKey = new apikeyModel({
    key: "user_api_key",
    role: userRole._id,
  });

  const editorApiKey = new apikeyModel({
    key: "editor_api_key",
    role: editorRole._id,
  });

  const adminApiKey = new apikeyModel({
    key: "admin_api_key",
    role: adminRole._id,
  });

  await Promise.all([
    userApiKey.save(),
    editorApiKey.save(),
    adminApiKey.save(),
  ]);

  console.log("Roles and API keys created successfully");
}

// createRolesAndApiKeys().catch(console.error);

module.exports = mongoDBInstance;
