const Credientials = require("../models/credentials.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      //buffer ->toString
      const publicKeyString = publicKey.toString();
      const tokens = await Credientials.create({
        user: userId,
        publicKey: publicKey,
      });
      console.log("Tokens", { publicKey, publicKeyString });
      // return tokens ? publicKeyString : null;
    } catch (er) {
      console.log(er);
    }
  };
}

module.exports = KeyTokenService;
