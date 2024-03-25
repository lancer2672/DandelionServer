const User = require("../models/user.model");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../../../classes/error/ErrorResponse");
const { sendVerificationEmail } = require("../../../mailer");
const CredentialService = require("./credential.service");
const AuthUtils = require("../../../auth/auth.utils");
const UserService = require("./user.service");
const CredentialModel = require("../models/credentials.model");
const fs = require("fs");
const path = require("path");

const privateKeyPath = path.join(__dirname, "../../../../private.key");
class AuthService {
  static register = async ({ email, firstname, lastname, dateOfBirth }) => {
    console.log(">>>register", { email, firstname, lastname, dateOfBirth });
    const existCredential = await CredentialService.findOne({
      email: email.toLowerCase(),
    });
    if (!existCredential) {
      throw new NotFoundError();
    }
    const user = await UserService.findOne({ credential: existCredential._id });
    if (!user) {
      throw new NotFoundError();
    }

    const userInfo = {
      email: email.toLowerCase(),
      avatar: {},
      lastname,
      firstname,
      dateOfBirth,
    };
    return await UserService.updateUser(user._id, userInfo);
  };
  static login = async ({ email, password }) => {
    const credential = await CredentialModel.findOne({
      email: email.toLowerCase(),
    });
    console.log(">>>Service.login", { credential, email });
    if (!credential || !credential.emailVerified) {
      throw new NotFoundError("User has not been verified");
    }
    const user = await UserService.findOne({ credential: credential._id });
    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    const compareRes = await AuthUtils.comparePasswords(
      password,
      credential.password
    );

    if (compareRes) {
      const privateKey = fs.readFileSync(privateKeyPath, "utf8");
      const { accessToken, refreshToken } = AuthUtils.generateTokenPair(
        { userId: user._id },
        privateKey
      );
      await CredentialService.updateCredential({
        credential,
        updates: {
          accessToken,
          refreshToken,
        },
      });
      return {
        token: accessToken,
        refreshToken: refreshToken,
        user,
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
    //   });
    // }
    // const { accessToken, refreshToken } =  AuthUtils.generateTokenPair(
    //   { userId: user._id },
    // );
    // await CredentialService.updateCredential({
    //   credential,
    //   accessToken,
    //   refreshToken,
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
  static refreshToken = async ({ credential, userId, refreshToken }) => {
    console.log("refreshToken", refreshToken);
    if (credential.refreshTokensUsed.includes(refreshToken)) {
      await CredentialService.refreshCredentials(
        credentialWithUsedRefreshToken
      );
      throw new ForbiddenError("Something wrong !! Relogin");
    }

    if (credential.refreshToken != refreshToken) throw new UnauthorizedError();

    const foundUser = UserService.findById(userId);
    if (!foundUser) throw new UnauthorizedError();
    //create new token pair
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");
    const newTokens = AuthUtils.generateTokenPair({ userId }, privateKey);

    await CredentialService.updateCredential({
      credential,
      updates: {
        refreshTokensUsed: [...credential.refreshTokensUsed, refreshToken],
        refreshToken: newTokens.refreshToken,
        accessToken: newTokens.accessToken,
      },
    });

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

    const updateFields = {
      emailVerificationCode: null,
      emailVerificationCodeExpires: null,
    };
    // in case user register
    if (password) {
      const passwordHash = await AuthUtils.hashPassword(password);
      updateFields.password = passwordHash;
      updateFields.emailVerified = true;
    }

    await CredentialService.updateCredential({
      credential,
      updates: updateFields,
    });
  };
  static sendEmailVerification = async ({ email, isRegister = false }) => {
    let credential = await CredentialService.findByEmail(email);

    if (isRegister) {
      if (credential && credential.emailVerified) {
        throw new BadRequestError("Email is already taken");
      } else if (!credential) {
        credential = await CredentialService.createCredential({
          email: email.toLowerCase(),
        });
      }

      const user = await UserService.findOne({ credential: credential._id });
      //create if user not exists
      if (!user) {
        await UserService.createUser({ credential: credential._id });
      }
    }
    //user not register yet
    if (!credential) {
      throw new NotFoundError();
    }

    const code = AuthUtils.generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await CredentialService.updateCredential({
      credential,
      updates: {
        emailVerificationCode: code,
        emailVerified: false,
        emailVerificationCodeExpires: expires,
      },
    });

    await sendVerificationEmail(email, code);
  };
  static resetPassword = async ({ email, newPassword }) => {
    const credential = await CredentialService.findByEmail(email);
    const user = await UserService.findOne({ credential: credential._id });

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
    const credential = await CredentialService.findById(user.credential);

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
