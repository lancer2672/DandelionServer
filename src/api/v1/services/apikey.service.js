const ApiKeyModal = require("../models/apikey.model");

class ApiKeyService {
  static findByKey = async (key) => {
    const objKey = await ApiKeyModal.findOne({ key, status: true }).lean();
    return objKey;
  };
  static findApiGatewayKey = async (key) => {
    const objKey = await ApiKeyModal.findOne({
      key,
      status: true,
      isApiGateway: { $ne: null },
    }).lean();
    return objKey;
  };
}
module.exports = ApiKeyService;
