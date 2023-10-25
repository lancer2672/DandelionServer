const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const voximplantService = require("../services/voximplant");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const { sendVerificationEmail } = require("../services/mailer");

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
  const existUser = await User.findOne({
    email: email.toLowerCase(),
    emailVerified: true,
  });
  if (existUser) {
    throw new BadRequestError("Email is already taken");
  }
  bcrypt.hash(password, 12, async (err, passwordHash) => {
    if (err) {
      throw new InternalServerError();
    } else if (passwordHash) {
      const newUser = new User({
        username: email.toLowerCase(),
        password: passwordHash,
        email: email.toLowerCase(),
        avatar: null,
        lastname,
        firstname,
        dateOfBirth,
        nickname,
      });
      try {
        await newUser.save();
      } catch (err) {
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
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
    const existUser = await User.findOne({
      username: username.toLowerCase(),
      emailVerified: true,
    });
    if (!existUser) {
      throw new BadRequestError("User does not exist");
    } else {
      bcrypt.compare(password, existUser.password, async (err, compareRes) => {
        if (err) {
          throw new InternalServerError("Error while checking user password");
        } else if (compareRes) {
          const accessToken = generateAccessToken(existUser._id);
          const refreshToken = generateRefreshToken(existUser._id);
          existUser.refreshToken = refreshToken;
          await existUser.save();
          delete existUser.password;

          new OK({
            message: "User logged in successfully",
            data: { token: accessToken, user: existUser },
          }).send(res);
          // res.status(200).json({
          //   message: "User logged in successfully",
          //   data: { token: accessToken, user: existUser },
          // });
        } else {
          throw new BadRequestError("Incorect password");
        }
      });
    }
    console.log("success");
  } catch (err) {
    console.log("err", err);
    throw new InternalServerError();
  }
};
exports.loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  try {
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
        refreshToken,
        voximplantPassword: email,
      });
      await voximplantService.addUser({
        userName: email.split("@")[0].toLowerCase(),
        userDisplayName: nickname,
        userPassword: email,
      });
      await user.save();
    }

    new OK({
      message: "User logged in successfully",
      data: { token: accessToken, user },
    }).send(res);
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.refreshToken = async (req, res) => {
  const user = User.findById(req.userId);
  const refreshToken = user.refreshToken;
  if (!refreshToken) {
    throw new UnauthorizedError();
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        if (err) {
          if (err.name === "TokenExpiredError") {
            user.refreshToken = null;
            user.refreshTokensUsed.push(refreshToken);
            await user.save();
            return res.status(401).json({ message: "Token expired" });
          } else {
            return res.status(403).json({ message: "Forbidden" });
          }
        }
      }
      const userId = decoded.userId;
      const newAccessToken = generateAccessToken(userId);

      res.status(200).json({ message: "success", accessToken: newAccessToken });
    }
  );
};
exports.verifyEmail = async (req, res) => {
  try {
    const { code, password, isResetPassword } = req.query;
    console.log(code, password, isResetPassword);
    const user = await User.findOne({ emailVerificationCode: code });

    if (!user) {
      throw new BadRequestError("Invalid verification code");
    }

    if (user.emailVerificationCodeExpires < new Date()) {
      throw new BadRequestError("Verification code has expired");
    }

    if (JSON.parse(isResetPassword) == false) {
      await voximplantService.addUser({
        userName: user.email.split("@")[0].toLowerCase(),
        userDisplayName: user.nickname,
        userPassword: password,
      });
      user.emailVerified = true;
    }
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpires = null;

    await user.save();
    new OK({}).send(res);
  } catch (er) {
    console.log("er", er);
    throw new BadRequestError("Failed");
  }
};
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email, isResetPassword } = req.body;
    if (!email) {
      throw new BadRequestError("Email is empty");
    }
    const code = generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: isResetPassword ? true : false,
    });

    if (!user) {
      throw new BadRequestError("User does not");
    }

    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = expires;
    await user.save();
    const result = await sendVerificationEmail(email, code);
    new OK().send(res);
  } catch (er) {
    throw new InternalServerError();
  }
};
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: true,
    });
    bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
      if (err) {
        throw new InternalServerError("Harsh password failed");
      } else if (passwordHash) {
        user.password = passwordHash;
        try {
          await user.save();
        } catch (err) {
          throw new InternalServerError("Update password failed");
        }
        const updatedVoximplantUser = {
          userPassword: newPassword,
        };
        await voximplantService.setUserInfo(updatedVoximplantUser);
        user.emailVerificationCode = null;
        user.emailVerificationCodeExpires = null;
        new OK({
          message: "Password reset successfully",
          data: { user },
        }).send(res);
      }
    });
  } catch (err) {
    throw new InternalServerError();
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  try {
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("currentPassword, newPassword", isMatch, user.password);

    if (!isMatch) {
      throw new BadRequestError("Password is incorrect");
    }
    bcrypt.hash(newPassword, 12, async (err, passwordHash) => {
      if (err) {
        throw new InternalServerError("Harsh password failed");
      } else if (passwordHash) {
        user.password = passwordHash;
        try {
          await user.save();
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
  } catch (err) {
    throw new InternalServerError();
  }
};
