const User = require("../models/user.model");
const Credential = require("../models/credentials.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
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
const AuthService = require("../services/auth.service");

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

  const { refreshToken, accessToken } = await AuthService.refreshToken(
    req.body.refreshToken
  );
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
