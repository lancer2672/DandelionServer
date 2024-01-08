const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const { OAuth2Client } = require("google-auth-library");
const { sendVerificationEmail } = require("../mailer");
const CredentialService = require("./credential.service");
const AuthUtils = require("../auth/auth.utils");
const UserService = require("./user.service");
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
    await CredentialService.createCredential({
      user: newUser,
      password: passwordHash,
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
      const { accessToken, refreshToken } = AuthUtils.generateTokenPair(
        { userId: existUser._id },
        privateKey
      );
      await CredentialService.updateCredential({
        credential: existCredential,
        updates: {
          accessToken,
          refreshToken,
          publicKey,
          privateKey,
        },
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
    // const { accessToken, refreshToken } =  AuthUtils.generateTokenPair(
    //   { userId: user._id },
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
  static refreshToken = async (refreshToken) => {
    console.log("refreshToken", refreshToken);
    const credentialWithUsedRefreshToken =
      await CredentialService.findByRefreshTokenUsed(refreshToken);
    //check if refreshToken used
    console.log(
      "credentialWithUsedRefreshToken",
      credentialWithUsedRefreshToken
    );

    if (credentialWithUsedRefreshToken) {
      const { privateKey, accessToken } = credentialWithUsedRefreshToken;
      const { userId } = AuthUtils.verifyJWT(refreshToken, privateKey);
      console.log("refreshToken: ", { userId });
      await CredentialService.refreshCredentials(
        credentialWithUsedRefreshToken
      );
      throw new ForbiddenError("Something wrong !! Relogin");
    }

    const holderToken = await CredentialService.findByRefreshToken(
      refreshToken
    );
    console.log("Holder", holderToken, refreshToken);
    if (!holderToken) throw new UnauthorizedError();

    const { userId } = AuthUtils.verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    const foundUser = UserService.findById(userId);
    if (!foundUser) throw new UnauthorizedError();
    //create new token pair
    const newTokens = AuthUtils.generateTokenPair(
      { userId },
      holderToken.privateKey
    );

    await CredentialService.updateCredential({
      credential: holderToken,
      updates: {
        refreshTokensUsed: [...holderToken.refreshTokensUsed, refreshToken],
        refreshToken: newTokens.refreshToken,
        accessToken: newTokens.accessToken,
      },
    });

    if (!refreshToken) {
      throw new UnauthorizedError();
    }
    return {
      refreshToken: newTokens.refreshToken,
      accessToken: newTokens.accessToken,
    };
  };
  static verifyEmail = async ({ code, password }) => {
    const credential = await CredentialService.findByVerificationCode(code);
    if (!credential) {
      throw new BadRequestError("Invalid verification code");
    }

    if (credential.emailVerificationCodeExpires < new Date()) {
      throw new BadRequestError("Verification code has expired");
    }
    await CredentialService.updateCredential({
      credential,
      updates: {
        emailVerificationCode: null,
        emailVerified: true,
        emailVerificationCodeExpires: null,
      },
    });
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
    await CredentialService.updateCredential({
      credential,
      updates: {
        emailVerificationCode: code,
        emailVerified: true,
        emailVerificationCodeExpires: expires,
      },
    });

    const result = await sendVerificationEmail(email, code);
  };
  static resetPassword = async ({ email, newPassword }) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    const credential = await CredentialService.findByUserId(user._id);

    const passwordHash = await AuthUtils.hashPassword(newPassword);
    credential.password = passwordHash;
    await CredentialService.updateCredential({
      credential,
      updates: {
        password: passwordHash,
      },
    });

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

    await CredentialService.updateCredential({
      credential,
      updates: {
        password: passwordHash,
      },
    });

    return user;
  };

  static logout = async (userCredential) => {
    CredentialService.refreshCredentials(userCredential);
  };
}

module.exports = AuthService;
