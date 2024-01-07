const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const { OAuth2Client } = require("google-auth-library");
const { sendVerificationEmail } = require("../mailer");
const CredentialService = require("./credential.service");
const AuthUtils = require("../auth/auth.utils");
class AuthService {
  static register = async ({
    password,
    email,
    firstname,
    lastname,
    dateOfBirth,
  }) => {
    const nickname = `${lastname} ${firstname}`;
    const existUser = await User.findOne({ email: email.toLowerCase() });
    const existCredential = existUser
      ? await CredentialService.findByUserId(existUser._id)
      : null;

    if (existCredential && existCredential.emailVerified) {
      throw new BadRequestError("Email is already taken");
    }

    const passwordHash = await AuthUtils.hashPassword(password);

    let newUser = new User({
      email: email.toLowerCase(),
      avatar: {},
      lastname,
      firstname,
      dateOfBirth,
      nickname,
    });

    await newUser.save();

    const { privateKey, publicKey } = AuthUtils.generateKeyPair();

    await CredentialService.createCredential({
      user: newUser,
      password: passwordHash,
      publicKey,
      privateKey,
    });

    return newUser;
  };
  static login = async ({ email, password }) => {
    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (!existUser) {
      throw new NotFoundError("User does not exist");
    }

    const existCredential = await CredentialService.findByUserId(existUser._id);
    if (!existCredential || !existCredential.emailVerified) {
      throw new NotFoundError("User has not been verified");
    }

    const compareRes = await AuthUtils.comparePasswords(
      password,
      existCredential.password
    );

    if (!compareRes) {
    }
    if (compareRes) {
      const { privateKey, publicKey } = AuthUtils.generateKeyPair();
      const { accessToken, refreshToken } = await AuthUtils.generateTokenPair(
        { userId: existUser._id },
        publicKey,
        privateKey
      );
      await CredentialService.updateCredential({
        credential: existCredential,
        accessToken,
        refreshToken,
        publicKey,
        privateKey,
      });

      return {
        token: accessToken,
        refreshToken: refreshToken,
        user: existUser,
      };
    } else {
      throw new BadRequestError("Incorrect information");
    }
  };
  static loginWithGoogle = async ({ idToken }) => {
    // const client = new OAuth2Client(process.env.CLIENT_ID);
    // const ticket = await client.verifyIdToken({
    //   idToken,
    //   audience: process.env.CLIENT_ID,
    // });
    // const payload = ticket.getPayload();
    // const email = payload["email"];
    // const familyName = payload["family_name"];
    // const givenName = payload["given_name"];
    // let user = await User.findOne({ email: email.toLowerCase() });
    // let credential = user ? await Credential.findOne({ user: user._id }) : null;
    // if (!user) {
    //   const nickname = familyName + " " + givenName;
    //   user = new User({
    //     email,
    //     nickname,
    //     firstname: givenName,
    //     lastname: familyName,
    //   });
    //   await user.save();
    //   const passwordHash = await AuthUtils.hashPassword(password);
    //   const { privateKey, publicKey } = AuthUtils.generateKeyPair();
    //   await CredentialService.createCredential({
    //     user,
    //     password: passwordHash,
    //     publicKey,
    //     privateKey,
    //   });
    // }
    // const { accessToken, refreshToken } = await AuthUtils.generateTokenPair(
    //   { userId: user._id },
    //   publicKey,
    //   privateKey
    // );
    // await CredentialService.updateCredential({
    //   credential,
    //   accessToken,
    //   refreshToken,
    //   publicKey,
    //   privateKey,
    // });
    // if (credential) {
    //   credential.accessToken = accessToken;
    //   credential.refreshToken = refreshToken;
    //   await credential.save();
    // }
    // return {
    //   message: "User logged in successfully",
    //   data: { token: accessToken, refreshToken, user },
    // };
  };
  static refreshToken = async ({ refreshToken }) => {
    const credential = await Credential.findOne({ refreshToken });
    if (!refreshToken) {
      throw new UnauthorizedError();
    }

    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              credential.refreshToken = null;
              credential.refreshTokensUsed.push(refreshToken);
              await credential.save();
              reject(new Error("Token expired"));
            } else {
              reject(new Error("Forbidden"));
            }
          }
          const userId = decoded.userId;
          const { accessToken } = await AuthUtils.generateTokenPair(
            { userId },
            credential.publicKey,
            credential.privateKey
          );
          credential.accessToken = accessToken;

          await credential.save();

          resolve(accessToken);
        }
      );
    });
  };
  static verifyEmail = async ({ code, password }) => {
    const credential = await Credential.findOne({
      emailVerificationCode: code,
    });
    if (!credential) {
      throw new BadRequestError("Invalid verification code");
    }

    if (credential.emailVerificationCodeExpires < new Date()) {
      throw new BadRequestError("Verification code has expired");
    }

    credential.emailVerified = true;
    credential.emailVerificationCode = null;
    credential.emailVerificationCodeExpires = null;

    await credential.save();
  };
  static sendEmailVerification = async ({ email }) => {
    if (!email) {
      throw new BadRequestError("Email is empty");
    }
    const code = AuthUtils.generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    const credential = await CredentialService.findByUserId(user._id);

    credential.emailVerificationCode = code;
    credential.emailVerificationCodeExpires = expires;
    await credential.save();
    const result = await sendVerificationEmail(email, code);
  };
  static resetPassword = async ({ email, newPassword }) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    const credential = await Credential.findOne({ user: user._id });

    const passwordHash = await AuthUtils.hashPassword(newPassword);
    credential.password = passwordHash;
    try {
      await credential.save();
    } catch (err) {
      throw new InternalServerError("Update password failed");
    }
    return user;
  };
  static changePassword = async ({ userId, currentPassword, newPassword }) => {
    const user = await User.findById(userId);
    const credential = await CredentialService.findByUserId(user._id);

    const isMatch = await AuthUtils.comparePasswords(
      currentPassword,
      credential.password
    );

    if (!isMatch) {
      throw new BadRequestError("Password is incorrect");
    }

    const passwordHash = await AuthUtils.hashPassword(newPassword);
    credential.password = passwordHash;

    try {
      await credential.save();
    } catch (err) {
      throw new InternalServerError("Update password failed");
    }

    return user;
  };

  static logout = async (userCredential) => {
    const credential = await CredentialService.findById(userCredential._id);

    if (!credential) {
      throw new BadRequestError("Credential does not exist");
    }

    //instead of remove credentail (stuck with password) so I refresh data
    credential.refreshTokensUsed = [];
    credential.refreshToken = null;
    credential.accessToken = null;
    credential.publicKey = null;
    credential.privateKey = null;

    await credential.save();
  };
}

module.exports = AuthService;
