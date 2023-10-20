const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const CHECK_TIME = 5000;
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("Number of connections", numConnection);
};
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus.length;
    const memUsage = process.memoryUsage().rss;
    console.log(`Active connections: ${numConnections}`);
    console.log(`Memory usage: ${memUsage / 1024 / 1024} MB`);
    //max connections per cores (5 for example )
    const maxConnection = numCores * 5;
    if (numConnections > maxConnection) {
      console.log("Connection overload detected");
    }
  }, CHECK_TIME);
};
module.exports = {
  countConnect,
  checkOverload,
};
