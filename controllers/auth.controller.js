const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const voximplantService = require("../voximplant");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const { sendVerificationEmail } = require("../mailer");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
function generateVerificationCode() {
  return Math.floor(Math.random() * 900000) + 100000;
}

exports.register = async (req, res) => {
  const { password, email, firstname, lastname, dateOfBirth } = req.body;
  const nickname = `${lastname} ${firstname}`;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  // Find existing user and credential
  const existUser = await User.findOne({ email: email.toLowerCase() });
  const existCredential = existUser
    ? await Credential.findOne({ user: existUser._id })
    : null;

  if (existCredential && existCredential.emailVerified) {
    throw new BadRequestError("Email is already taken");
  }

  bcrypt.hash(password, 12, async (err, passwordHash) => {
    if (err) {
      throw new InternalServerError();
    } else if (passwordHash) {
      let newUser;
      if (existUser) {
        // If user exists but is not verified, overwrite the user
        newUser = existUser;
        newUser.username = email.toLowerCase();
        newUser.lastname = lastname;
        newUser.firstname = firstname;
        newUser.dateOfBirth = dateOfBirth;
        newUser.nickname = nickname;
      } else {
        // If user does not exist, create a new user
        newUser = new User({
          username: email.toLowerCase(),
          email: email.toLowerCase(),
          avatar: null,
          lastname,
          firstname,
          dateOfBirth,
          nickname,
        });
      }

      try {
        await newUser.save();
        let newCredential;
        if (existCredential) {
          // If credential exists, overwrite the credential
          newCredential = existCredential;
          newCredential.password = passwordHash;
        } else {
          // If credential does not exist, create a new credential
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
      } catch (err) {
        console.log("err", err);
        throw new InternalServerError();
      }

      new CreatedResponse({
        message: "Register successfully",
        data: { user: newUser },
      }).send(res);
    }
  });
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const existUser = await User.findOne({ email: email.toLowerCase() });
  if (!existUser) {
    throw new NotFoundError("User does not exist");
  } else {
    const existCredential = await Credential.findOne({ user: existUser._id });
    if (!existCredential || !existCredential.emailVerified) {
      throw new NotFoundError("User has not been verified");
    }

    const compareRes = await bcrypt.compare(password, existCredential.password);
    if (compareRes) {
      const accessToken = generateAccessToken(existUser._id);
      const refreshToken = generateRefreshToken(existUser._id);
      existCredential.accessToken = accessToken;
      existCredential.refreshToken = refreshToken;
      await existCredential.save();

      new OK({
        message: "User logged in successfully",
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          user: existUser,
        },
      }).send(res);
    } else {
      throw new BadRequestError("Incorrect information");
    }
  }
};

exports.loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

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

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  if (!user) {
    const nickname = familyName + " " + givenName;
    user = new User({
      email,
      username: email,
      nickname,
      firstname: givenName,
      lastname: familyName,
    });
    await voximplantService.addUser({
      userName: email.split("@")[0].toLowerCase(),
      userDisplayName: nickname,
      userPassword: email,
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

  new OK({
    message: "User logged in successfully",
    data: { token: accessToken, user },
  }).send(res);
};

exports.refreshToken = async (req, res) => {
  const user = await User.findById(req.userId);
  console.log("UserRefreshToken", req.userId, user);
  const credential = await Credential.findOne({ user: user._id });
  const refreshToken = credential.refreshToken;
  if (!refreshToken) {
    throw new UnauthorizedError();
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          credential.refreshToken = null;
          credential.refreshTokensUsed.push(refreshToken);
          await credential.save();
          return res.status(401).json({ message: "Token expired" });
        } else {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const userId = decoded.userId;
      const newAccessToken = generateAccessToken(userId);
      credential.accessToken = newAccessToken;
      await credential.save();

      res.status(200).json({ message: "success", accessToken: newAccessToken });
    }
  );
};

exports.verifyEmail = async (req, res) => {
  const { code, password, isResetPassword } = req.query;
  console.log(code, password, isResetPassword);
  const credential = await Credential.findOne({ emailVerificationCode: code });

  if (!credential) {
    throw new BadRequestError("Invalid verification code");
  }

  if (credential.emailVerificationCodeExpires < new Date()) {
    throw new BadRequestError("Verification code has expired");
  }

  const user = await User.findById(credential.user);

  if (JSON.parse(isResetPassword) == false) {
    await voximplantService.addUser({
      userName: user.email.split("@")[0].toLowerCase(),
      userDisplayName: user.nickname,
      userPassword: password,
    });
    credential.emailVerified = true;
  }
  credential.emailVerificationCode = null;
  credential.emailVerificationCodeExpires = null;

  await credential.save();
  new OK({}).send(res);
};

exports.sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
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

    new OK({}).send(res);
  } catch (er) {
    console.log("send email er", er);
    throw new InternalServerError();
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const credential = await Credential.findOne({ user: user._id });

  bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
    if (err) {
      throw new InternalServerError("Hash password failed");
    } else if (passwordHash) {
      credential.password = passwordHash;
      try {
        await credential.save();
      } catch (err) {
        throw new InternalServerError("Update password failed");
      }
      const updatedVoximplantUser = {
        userPassword: newPassword,
      };
      await voximplantService.setUserInfo(updatedVoximplantUser);
      credential.emailVerificationCode = null;
      credential.emailVerificationCodeExpires = null;
      new OK({
        message: "Password reset successfully",
        data: { user },
      }).send(res);
    }
  });
};

exports.logout = async (req, res) => {
  const user = await User.findById(req.userId);
  const credential = await Credential.findOne({ user: user._id });

  if (!credential) {
    throw new BadRequestError();
  }

  credential.refreshTokensUsed.push(credential.refreshToken);
  credential.refreshToken = null;
  credential.accessToken = null;

  await credential.save();

  new OK({
    message: "Logout successfully",
    data: {},
  }).send(res);
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const user = await User.findById(req.userId);
  const credential = await Credential.findOne({ user: user._id });

  const isMatch = await bcrypt.compare(currentPassword, credential.password);

  if (!isMatch) {
    throw new BadRequestError("Password is incorrect");
  }

  bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
    if (err) {
      throw new InternalServerError("Hash password failed");
    } else if (passwordHash) {
      credential.password = passwordHash;

      try {
        await credential.save();
      } catch (err) {
        throw new InternalServerError("Update password failed");
      }

      const updatedVoximplantUser = {
        userPassword: newPassword,
      };

      await voximplantService.setUserInfo(updatedVoximplantUser);

      new OK({
        message: "Password changed successfully",
        data: { user },
      }).send(res);
    }
  });
};
