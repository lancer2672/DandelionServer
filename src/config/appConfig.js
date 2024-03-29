const vn_language = require("../i18n/vi");
const config = {
  app: {
    port: process.env.PORT || "3000",
    host: process.env.PORT || "localhost",
  },
  db: {
    user_name: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  redis: {
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  rabbitMQ: {
    url: process.env.RABBIT_URL,
  },
  language: vn_language,
};

module.exports = config;
