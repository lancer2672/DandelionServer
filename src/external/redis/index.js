const redis = require("redis");
const config = require("../../config/appConfig");
const { REDIS_CONNECTION_STATUS, DEFAULT_CLIENT } = require("../../constant");

const DEFAULT_CLIENT_CONFIG = {
  url: config.redis.url,
  username: config.redis.username,
  password: config.redis.password,
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

  async getDataFromCacheOrDB(cacheKey, dbQuery, options = {}) {
    try {
      const { redisClient = DEFAULT_CLIENT, cacheTime = ONE_HOUR } = options;
      const client = this.getClient(redisClient);
      const data = await client.get(cacheKey);
      if (data) {
        return { ...JSON.parse(data), isFromCache: true };
      } else {
        const result = await dbQuery();
        if (
          !Array.isArray(result) ||
          (Array.isArray(result) && result.length !== 0)
        ) {
          client.set(cacheKey, JSON.stringify(result), "EX", cacheTime);
        }
        return result;
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteCacheByKey(cacheKey, redisClient) {
    const client = this.getClient(redisClient);
    try {
      console.log("delete cache", cacheKey);
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
