const Credientials = require("../models/credentials.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      //buffer ->toString
      const publicKeyString = publicKey.toString();
      const tokens = await Credientials.create({
        user: userId,
        publicKey: publicKeyString,
      });
      console.log("Tokens", tokens);
      return tokens ? publicKeyString : null;
    } catch (er) {
      console.log(er);
    }
  };
}

module.exports = KeyTokenService;
