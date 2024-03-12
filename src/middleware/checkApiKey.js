const ApiKeyService = require("../api/v1/services/apikey.service");
const { HEADER } = require("../constant");

const checkApiKey = async (req, res, next) => {
  const key = req.headers[HEADER.API_KEY]?.toString();
  if (!key) {
    console.log("key", key);

    return res.status(403).json({
      message: "Forbidden Error",
    });
  }
  //check key

  const objKey = await ApiKeyService.findByKey(key);
  console.log("objKey", objKey);
  if (!objKey) {
    return res.status(403).json({
      message: "Forbidden Error",
    });
  }

  req.objKey = objKey;
  return next();
};

module.exports = checkApiKey;
