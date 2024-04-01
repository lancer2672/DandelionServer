const AuthUtils = require("../../../auth/auth.utils");
const CredentialModel = require("../models/credentials.model");
class CredentialService {
  static findOne = async (query) => {
    return await CredentialModel.findOne(query);
  };

  //TODO: reformat code
  static findByEmail = async (email) => {
    return await CredentialModel.findOne({ email: email.toLowerCase() });
  };
  static findById = async (id) => {
    return await CredentialModel.findById(id);
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

    await credential.save();
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await CredentialModel.findOne({
      refreshTokensUsed: { $in: [refreshToken] },
    });
  };

  static createCredential = async ({ email, password, publicKey }) => {
    let credential = new CredentialModel({
      email,
      password,
      refreshTokensUsed: [],
      publicKey,
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
