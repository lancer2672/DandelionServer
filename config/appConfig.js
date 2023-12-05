const config = {
  app: {
    port: process.env.PORT || "3000",
    host: process.env.PORT || "localhost",
  },
  db: {
    user_name: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
};

module.exports = config;
