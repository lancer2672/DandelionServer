const http = require("http");
const io = require("socket.io");
const setUpSocket = require("./index");
let server;
let socketIO;

const setUpServer = (app) => {
  server = http.Server(app);
  socketIO = io(server);
  setUpSocket(socketIO);
};
const getServer = () => server;
const getSocketIO = () => socketIO;
module.exports = {
  setUpServer,
  getSocketIO,
  getServer,
};
