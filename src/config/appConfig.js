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
  },
};

module.exports = config;
