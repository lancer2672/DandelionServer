const CredentialModel = require("../models/credentials.model");
const { Types } = require("mongoose");
class CredentialService {
  // static createKeyToken = async ({ userId, publicKey }) => {
  //   try {
  //     //buffer ->toString
  //     const publicKeyString = publicKey.toString();
  //     const tokens = await CredentialModel.create({
  //       user: userId,
  //       publicKey: publicKey,
  //     });
  //     console.log("Tokens", { publicKey, publicKeyString });
  //     // return tokens ? publicKeyString : null;
  //   } catch (er) {
  //     console.log(er);
  //   }
  // };
  static findByUserId = async (userId) => {
    return await CredentialModel.findOne({ user: userId });
  };
  static findByRefreshToken = async (refreshToken) => {
    return await CredentialModel.findOne({ refreshToken });
  };
  static findByVerificationCode = async (verificationCode) => {
    return await CredentialModel.findOne({
      emailVerificationCode: verificationCode,
    });
  };
  static refreshCredentials = async (userCredential) => {
    const credential = await CredentialModel.findById(userCredential._id);

    if (!credential) {
      throw new BadRequestError("Credential does not exist");
    }

    // Update the credential with new data
    credential.refreshTokensUsed = [];
    credential.refreshToken = null;
    credential.accessToken = null;
    credential.publicKey = null;
    credential.privateKey = null;

    await credential.save();
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await CredentialModel.findOne({
      refreshTokensUsed: { $in: [refreshToken] },
    });
  };

  static createCredential = async ({
    user,
    password,
    publicKey,
    privateKey,
  }) => {
    const passwordHash = await AuthUtils.hashPassword(password);
    let credential = new CredentialModel({
      user: user._id,
      password: passwordHash,
      refreshTokensUsed: [],
      publicKey,
      privateKey,
    });
    await credential.save();
    return credential;
  };
  static updateCredential = async ({ credential, updates }) => {
    const updatedCredential = await CredentialModel.findOneAndUpdate(
      { _id: credential._id },
      { $set: updates },
      { new: true }
    );
    return updatedCredential;
  };
}

module.exports = CredentialService;
