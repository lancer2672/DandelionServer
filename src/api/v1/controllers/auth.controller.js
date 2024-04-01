const {
  BadRequestError,
  InternalServerError,
} = require("../../../classes/error/ErrorResponse");
const {
  OK,
  CreatedResponse,
} = require("../../../classes/success/SuccessResponse");
const { validationResult } = require("express-validator");
const AuthService = require("../services/auth.service");
const ApiKeyService = require("../services/apikey.service");
const { PermissionService, RoleService } = require("../services/role.service");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const newUser = await AuthService.register(req.body);
  new CreatedResponse({
    message: "Register successfully",
    data: { user: newUser },
  }).send(res);
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }
  const loginData = await AuthService.login(req.body);
  new OK({
    message: "User logged in successfully",
    data: loginData,
  }).send(res);
};
exports.getCredentialByUserId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const { user, credential } = await AuthService.getCredentialByUserId(
    req.params.userId
  );
  new OK({
    message: "success",
    data: { user, credential },
  }).send(res);
};
exports.checkApiKey = async function (req, res) {
  try {
    const apiKey = await ApiKeyService.findByKey(req.body.apikey);
    if (!apiKey) {
      return res.status(401).json({ message: "Invalid API Key" });
    }
    const role = await RoleService.findById(apiKey.role);
    const permission = await PermissionService.findById(role.permissions);

    return res.json({ role, permission });
  } catch (err) {
    throw new InternalServerError("Invalid information");
  }
};

exports.loginWithGoogle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const loginData = await AuthService.loginWithGoogle(req.body);
  new OK({
    message: "User logged in successfully",
    data: loginData,
  }).send(res);
};

exports.refreshToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const { refreshToken, accessToken } = await AuthService.refreshToken({
    credential: req.credential,
    refreshToken: req.refreshToken,
    userId: req.userId,
  });
  new OK({
    message: "success",
    data: { refreshToken, accessToken },
  }).send(res);
};

exports.verifyEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  await AuthService.verifyEmail(req.query);
  new OK({}).send(res);
};

exports.sendEmailVerification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  await AuthService.sendEmailVerification(req.body);
  new OK({}).send(res);
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const user = await AuthService.resetPassword(req.body);
  new OK({
    message: "Password reset successfully",
    data: { user },
  }).send(res);
};
exports.logout = async (req, res) => {
  await AuthService.logout(req.credential);

  new OK({
    message: "Logout successfully",
    data: {},
  }).send(res);
};
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Invalid information");
  }

  const user = await AuthService.changePassword({
    ...req.body,
    userId: req.userId,
  });
  new OK({
    message: "Password changed successfully",
    data: { user },
  }).send(res);
};
