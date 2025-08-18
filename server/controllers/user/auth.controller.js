const User = require("../../models/user");
const BaseController = require("../base.controller");
const { user: userService } = require("../../services/user");
const {
  getTokenPair,
  clearRefreshTokenCookie,
  verifyRefreshToken,
} = require("../../services/jwt.service");
const logger = require("../../utils/logger");
const asyncHandler = require("../../utils/asyncHandler");
const {
  AppError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createConflictError,
  createServerError,
} = require("../../utils/errors");

/**
 * Auth Controller - Function-based approach with BaseController utilities
 *
 * PURPOSE: Handle authentication operations (register, login, logout, refresh)
 * PATTERN: Functions + BaseController helpers (Industry Standard for Express)
 * SECURITY: JWT-based authentication with refresh tokens
 */

// Create BaseController instance for utility methods
const baseController = new BaseController();

/**
 * Send JWT Tokens Response
 *
 * PURPOSE: Generate and send access/refresh tokens with consistent response format
 * PATTERN: Helper function using BaseController utilities
 */
const sendStatusToken = async (user, statusCode, res) => {
  const tokenData = await getTokenPair(user);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  logger.auth("Tokens generated", user._id, {
    email: user.email,
    hasRefreshToken: !!tokenData.refreshToken,
  });

  // Set cookie and use BaseController for consistent response
  res.cookie("refreshToken", tokenData.refreshToken, cookieOptions);

  return baseController.sendSuccess(
    res,
    {
      token: tokenData.accessToken,
      user: tokenData.user,
    },
    "Tokens generated successfully",
    statusCode
  );
};

const register = asyncHandler(async (req, res) => {
  const userDTO = {
    email: req.body.email,
    password: req.body.password,
    profile: req.body.profile,
    role: req.body.role,
  };

  baseController.logAction("register_user", req, { email: userDTO.email });
  const user = await userService.createUser(userDTO);

  sendStatusToken(user, 201, res);
}, "register_user");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  baseController.logAction("login_user", req, { email });
  const user = await userService.authenticateUser(email, password);

  sendStatusToken(user, 200, res);
}, "login_user");

const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);

  const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
  const data = await userService.logoutUser(req.user._id, refreshToken);

  baseController.sendSuccess(res, data, "User logged out successfully", 200);
}, "logout_user");

const handleTokenRefresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  const user = await userService.refreshUserTokens(refreshToken);

  sendStatusToken(user, 200, res);
}, "refresh_tokens");

const forgotPassword = asyncHandler(async (req, res) => {
  // TODO: Implement forgot password functionality
  // - Generate reset token
  // - Send reset email
  // - Store reset token with expiry
  throw new AppError(
    "Forgot password feature not implemented yet",
    501,
    "NOT_IMPLEMENTED"
  );
}, "password_reset_request");

module.exports = {
  register,
  login,
  logout,
  handleTokenRefresh,
  forgotPassword,
};
