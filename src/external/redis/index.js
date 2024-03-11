const redis = require("redis");
const config = require("../../config/appConfig");
const { RedisConnectStatus } = require("../../constant");

const DEFAULT_CLIENT_CONFIG = {
  url: config.redis.url,
};

const DEFAULT_CLIENT = "default";
const redisClientListener = async (clientName = "", redisClient) => {
  await redisClient
    .connect()
    .then(() => {
      console.log(`Redis Client "${clientName}": Connected`);
    })
    .catch((er) => {
      console.log(`Redis Client ${clientName}: Error`, err);
    });
  //   redisClient.on(RedisConnectStatus.CONNECT, () => {
  //     console.log(`Redis Client ${clientName}: Connected`);
  //   });
  //   redisClient.on(RedisConnectStatus.ERROR, (err) => {
  //     console.log(`Redis Client ${clientName}: Error`, err);
  //   });
  //   redisClient.on(RedisConnectStatus.RECONNECT, () => {
  //     console.log(`Redis Client ${clientName}: Reconnecting`);
  //   });
};
class RedisClient {
  //create new redis instance

  constructor() {
    this.clients = {};

    //NOTE: not recommended
    //init client
    (async () => {
      await this.connect(DEFAULT_CLIENT, DEFAULT_CLIENT_CONFIG);
    })();
  }
  //init new Redis client
  async connect(name, options) {
    this.clients[name] = redis.createClient(options);
    await redisClientListener(name, this.clients[name]);
  }
  getClient(name) {
    return this.clients[name];
  }
}

const redisClientInstance = new RedisClient();
module.exports = redisClientInstance;
