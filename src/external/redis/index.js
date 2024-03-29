const redis = require("redis");
const config = require("../../config/appConfig");
const { REDIS_CONNECTION_STATUS, DEFAULT_CLIENT } = require("../../constant");

const DEFAULT_CLIENT_CONFIG = {
  url: config.redis.url,
  username: "default",
  password: "ZEX02U1NMRK7ZbpOMXv75nFBICsiDY8E",
};
const ONE_HOUR = 60 * 60;
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

  setWithExpiration(clientName, key, value, expirationInSeconds) {
    const client = this.getClient(clientName);
    client.set(key, value, "EX", expirationInSeconds);
  }

  getClient(name) {
    return this.clients[name];
  }

  async getDataFromCacheOrDB(cacheKey, dbQuery, redisClient = DEFAULT_CLIENT) {
    try {
      const client = this.getClient(redisClient);
      const data = await client.get(cacheKey);
      if (data) {
        return JSON.parse(data);
      } else {
        const result = await dbQuery();
        client.set(cacheKey, JSON.stringify(result), "EX", ONE_HOUR);
        return result;
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteCacheByKey(cacheKey, redisClient) {
    const client = this.getClient(redisClient);
    try {
      const response = await client.del(cacheKey);
      return response;
    } catch (err) {
      throw err;
    }
  }
}

const redisClientInstance = new RedisClient();
redisClientInstance.connect(DEFAULT_CLIENT, DEFAULT_CLIENT_CONFIG);
module.exports = redisClientInstance;
