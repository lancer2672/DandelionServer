const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const errorHandler = require("../middleware/errorHandler");
const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../classes/error/ErrorResponse");
const CredentialService = require("../services/credential.service");
const ApiKeyService = require("../services/apikey.service");
const { HEADER } = require("../const");

class AuthUtils {
  static generateTokenPair = async (payload, publicKey, privateKey) => {
    const accessToken = await jwt.sign(payload, privateKey, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("verify error", err);
      } else {
        console.log("decode", decode);
      }
    });
    return {
      accessToken,
      refreshToken,
    };
  };

  static generateVerificationCode = () => {
    return Math.floor(Math.random() * 900000) + 100000;
  };

  static hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
  };

  static comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  static generateKeyPair = () => {
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    return {
      privateKey,
      publicKey,
    };
  };

  static checkApiKey = async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }
    //check key
    const objKey = await ApiKeyService.findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    req.objKey = objKey;
    return next();
  };

  static permission = (permission) => {
    return (req, res, next) => {
      if (!req.objKey.permissions) {
        return res.status(403).json({
          message: "Permission Denied",
        });
      }

      const validPermission = req.objKey.permissions.includes(permission);
      if (!validPermission) {
        return res.status(403).json({
          message: "Permission Denied",
        });
      }

      return next();
    };
  };

  static verifyAuthentication = errorHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new UnauthorizedError("Invalid Request");
    const credential = await CredentialService.findByUserId(userId);
    if (!credential) throw new NotFoundError("Not Found Credential");
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new UnauthorizedError("Invalid Request");

    try {
      const decodedUser = jwt.verify(accessToken, credential.publicKey);
      if (userId != decodedUser.userId) {
        throw new UnauthorizedError("Invalid Request");
      }
      //?
      req.credential = credential;
      req.userId = userId;
      return next();
    } catch (error) {
      throw error;
    }
  });
}

module.exports = AuthUtils;
