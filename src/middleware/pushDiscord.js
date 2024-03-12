const Logger = require("../logger/discord.log");

const pushLogToDiscord = async (req, res, next) => {
  try {
    // Logger.sendToMessage(req.get('host'))
    Logger.sendToFormatCode({
      title: `Method:${req.method}`,
      code: req.method === "GET" ? req.query : req.body,
      message: `${req.get("host")}${req.originalUrl}`,
    });
    return next();
  } catch (er) {
    next(er);
  }
};

module.exports = pushLogToDiscord;
