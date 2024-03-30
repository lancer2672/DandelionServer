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

  async getDataFromCacheOrDB(cacheKey, dbQuery, start, stop, options = {}) {
    try {
      const { redisClient = DEFAULT_CLIENT, cacheTime = ONE_HOUR } = options;
      const client = this.getClient(redisClient);

      let data = [];
      //just want to retrive from "start < stop" not "start <=stop"
      if (stop > 0) {
        data = await client.ZRANGE(cacheKey, start, stop - 1, { REV: true });
      }
      if (data.length > 0) {
        console.log("DATAFROMCACHE", data.length);
        return data.map((item) => JSON.parse(item));
      } else {
        const result = await dbQuery();

        if (Array.isArray(result) && result.length !== 0) {
          const multi = client.multi();
          result.forEach((item, index) => {
            const score = new Date(item.createdAt).getTime();
            multi.ZADD(cacheKey, {
              score: score,
              value: JSON.stringify(item),
            });
          });
          multi.expire(cacheKey, cacheTime);
          await multi.exec();
        }
        return result;
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteCacheByKey(cacheKey, options = {}) {
    const { redisClient = DEFAULT_CLIENT } = options;
    const client = this.getClient(redisClient);
    try {
      console.log("delete cache", cacheKey);
      const response = await client.del(cacheKey);
      return response;
    } catch (err) {
      throw err;
    }
  }
  async deleteCacheByKeyMatchPattern(cacheKey, options = {}) {
    const { redisClient = DEFAULT_CLIENT } = options;

    let cursor = "0";
    let keysToDelete = [];
    const client = this.clients[redisClient];
    do {
      const result = await redis.scanAsync(cursor, "MATCH", cacheKey);
      console.log("Result", result);
      // keysToDelete = keysToDelete.concat(foundKeys);
      // cursor = newCursor;
    } while (cursor !== "0");
    const deletedCount = await client.del(...keysToDelete);
    console.log(`Deleted ${deletedCount} keys.`);
  }
}

const redisClientInstance = new RedisClient();
redisClientInstance.connect(DEFAULT_CLIENT, DEFAULT_CLIENT_CONFIG);
module.exports = redisClientInstance;
