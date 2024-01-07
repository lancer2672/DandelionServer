const Credientials = require("../models/credentials.model");
const { Types } = require("mongoose");
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
  static findByUserId = async (userId) => {
    return await Credential.findOne({ user: userId });
  };

  static createCredential = async ({
    user,
    password,
    publicKey,
    privateKey,
  }) => {
    const passwordHash = await AuthUtils.hashPassword(password);
    let credential = new Credential({
      user: user._id,
      password: passwordHash,
      refreshTokensUsed: [],
      publicKey,
      privateKey,
    });
    await credential.save();
    return credential;
  };
  static updateCredential = async ({
    credential,
    accessToken,
    refreshToken,
    publicKey,
    privateKey,
  }) => {
    credential.accessToken = accessToken;
    credential.refreshToken = refreshToken;
    credential.publicKey = publicKey;
    credential.privateKey = privateKey;
    await credential.save();
    return credential;
  };
}

module.exports = KeyTokenService;
