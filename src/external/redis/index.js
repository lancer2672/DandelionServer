const redis = require("redis");
const config = require("../../config/appConfig");

const redis_config = {
  url: config.redis.url,
};
class RedisClient {
  constructor(options = redis_config) {
    this.client = redis.createClient(options);
    this.client
      .connect()
      .then(() => {
        console.log("Redis Client Connected");
      })
      .catch((er) => {
        console.error("Redis Client Error", er);
      });
  }

  async setup() {
    // Perform any necessary setup here
  }

  getClient() {
    return this.client;
  }
}

const redisClientInstance = new RedisClient();

module.exports = redisClientInstance;
