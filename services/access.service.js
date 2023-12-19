const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const { validationResult } = require("express-validator");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");

class AccessService {
  static generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  };

  static generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  };

  static register = async ({
    password,
    email,
    firstname,
    lastname,
    dateOfBirth,
  }) => {
    const nickname = `${lastname} ${firstname}`;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Invalid information");
    }

    const existUser = await User.findOne({ email: email.toLowerCase() });
    const existCredential = existUser
      ? await Credential.findOne({ user: existUser._id })
      : null;

    if (existCredential && existCredential.emailVerified) {
      throw new BadRequestError("Email is already taken");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let newUser;
    if (existUser) {
      newUser = existUser;
      newUser.username = email.toLowerCase();
      newUser.lastname = lastname;
      newUser.firstname = firstname;
      newUser.dateOfBirth = dateOfBirth;
      newUser.nickname = nickname;
    } else {
      newUser = new User({
        username: email.toLowerCase(),
        email: email.toLowerCase(),
        avatar: {},
        lastname,
        firstname,
        dateOfBirth,
        nickname,
      });
    }

    await newUser.save();
    let newCredential;
    if (existCredential) {
      newCredential = existCredential;
      newCredential.password = passwordHash;
    } else {
      newCredential = new Credential({
        user: newUser._id,
        password: passwordHash,
        refreshTokensUsed: [],
        emailVerificationCode: null,
        emailVerified: false,
        emailVerificationCodeExpires: null,
      });
    }

    await newCredential.save();
    return newUser;
  };

  static login = async ({ email, password }) => {
    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (!existUser) {
      throw new NotFoundError("User does not exist");
    }

    const existCredential = await Credential.findOne({ user: existUser._id });
    if (!existCredential || !existCredential.emailVerified) {
      throw new NotFoundError("User has not been verified");
    }

    const compareRes = await bcrypt.compare(password, existCredential.password);
    if (compareRes) {
      const accessToken = this.generateAccessToken(existUser._id);
      const refreshToken = this.generateRefreshToken(existUser._id);
      existCredential.accessToken = accessToken;
      existCredential.refreshToken = refreshToken;
      await existCredential.save();

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
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload["email"];
    const familyName = payload["family_name"];
    const givenName = payload["given_name"];
    const picture = payload["picture"];

    let user = await User.findOne({ email: email.toLowerCase() });
    let credential = user ? await Credential.findOne({ user: user._id }) : null;

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    if (!user) {
      const nickname = familyName + " " + givenName;
      user = new User({
        email,
        username: email,
        nickname,
        firstname: givenName,
        lastname: familyName,
      });

      await user.save();

      credential = new Credential({
        user: user._id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        refreshTokensUsed: [],
        emailVerificationCode: null,
        emailVerified: true,
        emailVerificationCodeExpires: null,
      });
      await credential.save();
    } else if (credential) {
      credential.accessToken = accessToken;
      credential.refreshToken = refreshToken;
      await credential.save();
    }

    return {
      message: "User logged in successfully",
      data: { token: accessToken, user },
    };
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
          const newAccessToken = this.generateAccessToken(userId);
          credential.accessToken = newAccessToken;

          await credential.save();

          resolve(newAccessToken);
        }
      );
    });
  };

  static verifyEmail = async ({ code, password, isResetPassword }) => {
    const credential = await Credential.findOne({
      emailVerificationCode: code,
    });

    if (!credential) {
      throw new BadRequestError("Invalid verification code");
    }

    if (credential.emailVerificationCodeExpires < new Date()) {
      throw new BadRequestError("Verification code has expired");
    }

    const user = await User.findById(credential.user);

    if (JSON.parse(isResetPassword) == false) {
      credential.emailVerified = true;
    }
    credential.emailVerificationCode = null;
    credential.emailVerificationCodeExpires = null;

    await credential.save();
  };

  static sendEmailVerification = async ({ email }) => {
    if (!email) {
      throw new BadRequestError("Email is empty");
    }
    const code = generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    const credential = await Credential.findOne({ user: user._id });

    credential.emailVerificationCode = code;
    credential.emailVerificationCodeExpires = expires;
    await credential.save();
    const result = await sendVerificationEmail(email, code);
  };

  static resetPassword = async ({ email, newPassword }) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    const credential = await Credential.findOne({ user: user._id });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    credential.password = passwordHash;
    try {
      await credential.save();
    } catch (err) {
      throw new InternalServerError("Update password failed");
    }

    credential.emailVerificationCode = null;
    credential.emailVerificationCodeExpires = null;
    return user;
  };
}

module.exports = AccessService;
