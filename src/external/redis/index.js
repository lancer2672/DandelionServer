const redis = require("redis");
const config = require("../../config/appConfig");
const { REDIS_CONNECTION_STATUS, DEFAULT_CLIENT } = require("../../constant");

const DEFAULT_CLIENT_CONFIG = {
  url: config.redis.url,
};
const handleConnectionTimeout = () => {};
const redisClientListener = async (clientName = "", redisClient) => {
  await redisClient
    .connect()
    .then(() => {
      console.log(`Redis Client "${clientName}": Connected`);
    })
    .catch((err) => {
      console.log(`Redis Client ${clientName}: Error`, err);
    });
};

class RedisClient {
  //create new redis instance

  constructor() {
    this.clients = {};
  }
  //init new Redis client
  async connect(name, options) {
    this.clients[name] = redis.createClient(options);
    return redisClientListener(name, this.clients[name]);
  }
  getClient(name) {
    return this.clients[name];
  }
}

const redisClientInstance = new RedisClient();
redisClientInstance.connect(DEFAULT_CLIENT, DEFAULT_CLIENT_CONFIG);
module.exports = redisClientInstance;
