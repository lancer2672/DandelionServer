const jwt = require("jsonwebtoken");
const {
  UnauthorizedError,
  NotFoundError,
} = require("../classes/error/ErrorResponse");
const CredentialService = require("../api/v1/services/credential.service");
const { HEADER } = require("../constant");
const errorHandler = require("./errorHandler");
const UserService = require("../api/v1/services/user.service");

const verifyAuthentication = errorHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new UnauthorizedError("Invalid Request");
  const user = await UserService.findById(userId);
  if (!user) throw new NotFoundError("Not Found User");
  const credential = await CredentialService.findById(user.credential);
  if (!credential) throw new NotFoundError("Not Found Credential");

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
      const decodedUser = jwt.verify(refreshToken, credential.privateKey);

      if (userId != decodedUser.userId) {
        throw new UnauthorizedError("Invalid Request");
      }
      //?
      req.credential = credential;
      req.userId = userId;
      console.log("request.userId", req.userId);
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

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

module.exports = verifyAuthentication;
