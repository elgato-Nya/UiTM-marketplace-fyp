const User = require("../../models/user");
const BaseController = require("../base.controller");
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
const sendStatusToken = asyncHandler(async (user, statusCode, res) => {
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
});

const register = asyncHandler(async (req, res) => {
  const { email, password, profile, role } = req.body;

  // Log action using BaseController utility
  baseController.logAction("user_registration", req, { email });

  logger.info("registration attempted", { email });

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    logger.warn("registration attempt with existing email", { email });
    throw createConflictError("Email already exists");
  }

  const userData = {
    email: email.toLowerCase(),
    password,
    profile: {
      username: profile.username,
      bio: profile.bio,
      phoneNumber: profile.phoneNumber,
      campus: profile.campus,
      faculty: profile.faculty,
    },
    role: role || ["consumer"],
  };

  const user = await User.create(userData);

  user.lastActive = new Date.now();
  await user.save({ validateBeforeSave: false });

  sendStatusToken(user, 201, res);
}, "user_registration");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Log action using BaseController utility
  baseController.logAction("user_login", req, { email });

  const user = await User.findByCredentials(email, password);
  if (!user) {
    logger.warn("login failed", { email });
    throw createAuthError("Invalid email or password");
  }

  user.lastActive = new Date.now();
  await user.save({ validateBeforeSave: false });

  sendStatusToken(user, 200, res);
}, "user_login");

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    clearRefreshTokenCookie(res);
    logger.warn("Logout attempt without refresh token", {
      action: "logout_user",
      route: req.originalUrl,
      method: req.method,
    });
    throw createAuthError("No refresh token provided");
  }

  const user = await User.findById(req.user._id).select("+refreshTokens");

  if (!user) {
    logger.warn(
      `Logout attempt without authenticated user. IP: ${req.ip}, SessionID: ${
        req.sessionID || "N/A"
      }`,
      {
        action: "logout_user",
        route: req.originalUrl,
        method: req.method,
      }
    );
    throw createAuthError("User not authenticated");
  }

  // Remove refresh token from user's token list
  user.refreshTokens = user.refreshTokens.filter(
    (token) => token !== refreshToken
  );
  if (user.refreshTokens.length === 0) {
    user.isActive = false;
  }
  await user.save({ validateBeforeSave: false });

  // Always clear the refreshToken cookie for security
  clearRefreshTokenCookie(res);

  logger.auth("User logged out successfully", user._id, {
    email: user.email,
    action: "logout_user",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}, "user_logout");

const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw createAuthError("No refresh token provided");
  }

  // Verify refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    logger.warn("Invalid refresh token", {
      action: "refresh_tokens",
      error: error.message,
    });
    throw createAuthError("Invalid refresh token");
  }

  if (!payload) {
    logger.warn("Refresh token verification failed: invalid token", {
      action: "refresh_tokens",
      refreshToken,
    });
    throw createAuthError("Invalid refresh token");
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw createNotFoundError("User");
  }

  if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
    throw createAuthError("Invalid refresh token");
  }

  user.lastActive = new Date.now();
  await user.save({ validateBeforeSave: false });

  sendStatusToken(user, 200, res);
}, "token_refresh");

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
  refreshTokens,
  forgotPassword,
};
