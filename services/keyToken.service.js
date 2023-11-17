const keytokenModel = require("../models/keytoken.model");
const KeyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      const tokens = await keytokenModel.create({
        userId,
        publicKey,
      });
      console.log("Tokens", tokens);
    } catch (er) {
      console.log(er);
    }
  };
}

module.exports = KeyTokenService;
