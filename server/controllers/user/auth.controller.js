const BaseController = require("../base.controller");
const { authService } = require("../../services/user");
const {
  getTokenPair,
  clearRefreshTokenCookie,
} = require("../../services/jwt.service");
const logger = require("../../utils/logger");
const { sanitizeObject, sanitizeInput } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");
const { AppError, createValidationError } = require("../../utils/errors");
const { User } = require("../../models/user");
const { sendVerificationEmail } = require("../../services/email.service");
const {
  generateTokenWithExpiry,
  hashToken,
} = require("../../services/token.service");

const baseController = new BaseController();

/**
 * PURPOSE: Generates JWT tokens for a user, sets the refresh token cookie, and sends a success response.
 *
 * @function sendStatusToken
 * @param {Object} user - The user object for whom the tokens are generated.
 * @param {number} statusCode - The HTTP status code to use in the response.
 * @param {Object} res - Express response object used to send the response and set cookies.
 * @returns {Object} Express response with tokens and user data in a consistent format.
 */
const sendStatusToken = async (user, statusCode, res) => {
  const tokenData = await getTokenPair(user);

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents JavaScript access - XSS protection
    secure: isProduction, // HTTPS only in production, allows HTTP in development
    sameSite: isProduction ? "strict" : "lax", // CSRF protection: strict in prod, lax for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  logger.auth("Tokens generated", user._id.toString(), {
    email: user.email,
    hasRefreshToken: !!tokenData.refreshToken,
  });

  // Set cookie and use BaseController for consistent response
  res.cookie("refreshToken", tokenData.refreshToken, cookieOptions);

  const { email, roles, profile } = user;

  const userData = {
    token: tokenData.accessToken,
    email,
    roles,
    profile, // Send the entire profile object including avatar
  };

  return baseController.sendSuccess(
    res,
    userData,
    "Tokens generated successfully",
    statusCode
  );
};

/**
 * PURPOSE: Handles user registration: sanitizes input, logs the action, creates the user, sends verification email, and responds.
 *
 * @function register
 * @returns {Promise<void>} Sends a response with success message upon successful registration.
 */
const register = asyncHandler(async (req, res) => {
  // Extract and trim email separately (don't sanitize it)
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  // Sanitize only the profile data (not email)
  const sanitizedProfile = sanitizeObject(req.body.profile || {});

  const userDTO = {
    email: email,
    profile: sanitizedProfile,
  };

  baseController.logAction("register_user", req, {
    email: email,
  });
  const user = await authService.createUser(userDTO, password);

  // Generate verification token and save to database
  const { token, expiresAt } = generateTokenWithExpiry(32, 24 * 60); // 24 hours
  const hashedToken = await hashToken(token);

  // Save hashed token to database
  await User.findByIdAndUpdate(user._id, {
    "emailVerification.token": hashedToken,
    "emailVerification.tokenExpires": expiresAt,
  });

  // Send verification email asynchronously (fire-and-forget)
  // Don't await - let it run in background to avoid blocking response
  sendVerificationEmail(user, token)
    .then(() => {
      logger.auth("Verification email sent", user._id, {
        email: user.email,
        expires: expiresAt,
      });
    })
    .catch((emailError) => {
      logger.warn("Failed to send verification email", {
        userId: user._id,
        email: user.email,
        error: emailError.message,
      });
      // User can request resend via resend endpoint
    });

  // Respond immediately without waiting for email
  baseController.sendSuccess(
    res,
    {},
    "Registration successful. Please check your email to verify your account.",
    201
  );
}, "register_user");

/**
 * PURPOSE: Handles user login: logs the action, authenticates the user, and responds with tokens.
 *
 * @function login
 * @returns {Promise<void>} Sends a response with a status token upon successful login.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();

  const user = await authService.authenticateUser(cleanEmail, password);
  baseController.logAction("login_user", req, { email: cleanEmail });

  await sendStatusToken(user, 200, res);
}, "login_user");

/**
 * PURPOSE: Handles user logout: clears the refresh token cookie, logs the action, and invalidates the refresh token.
 *
 * @function logout
 * @returns {Promise<void>} Sends a success response upon successful logout.
 */
const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);

  const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
  const data = await authService.logoutUser(req.user._id, refreshToken);

  baseController.logAction("logout_user", req, {
    email: req.user.email,
  });

  baseController.sendSuccess(res, data, "User logged out successfully", 200);
}, "logout_user");

/**
 * PURPOSE: Handles token refresh: verifies the refresh token, generates new tokens, and responds with them.
 *
 * @function handleTokenRefresh
 * @returns {Promise<void>} Sends a response with new tokens upon successful refresh.
 */
const handleTokenRefresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  const user = await authService.refreshUserTokens(refreshToken);

  await sendStatusToken(user, 200, res);
}, "refresh_tokens");

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();

  const user = await User.findOne({ email: cleanEmail }).select(
    "email profile emailVerification"
  );
  if (!user || user.emailVerification?.isVerified) {
    return baseController.sendSuccess(
      res,
      {},
      "If that email is registered and not yet verified, a verification email has been sent. No further action is needed, if you are already verified.",
      200
    );
  }

  // Generate new verification token
  const { token, expiresAt } = generateTokenWithExpiry(32, 24 * 60); // 24 hours
  const hashedToken = await hashToken(token);

  // Save hashed token to database
  await User.findByIdAndUpdate(user._id, {
    "emailVerification.token": hashedToken,
    "emailVerification.tokenExpires": expiresAt,
  });

  // Send verification email asynchronously (fire-and-forget)
  sendVerificationEmail(user, token)
    .then(() => {
      logger.auth("Resend verification email sent", user._id, {
        email: user.email,
        expires: expiresAt,
      });
    })
    .catch((emailError) => {
      logger.warn("Failed to resend verification email", {
        userId: user._id,
        email: user.email,
        error: emailError.message,
      });
    });

  baseController.logAction("resend_verification_email", req, {
    email: cleanEmail,
  });
  // Respond immediately without waiting for email
  baseController.sendSuccess(res, {}, "Verification email sent", 200);
}, "resend_verification_email");

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();
  const sanitizedToken = sanitizeInput(token);

  await authService.verifyEmail(cleanEmail, sanitizedToken);

  baseController.logAction("verify_email", req, { email: cleanEmail });
  baseController.sendSuccess(res, {}, "Email verified successfully", 200);
}, "verify_email");
/**
 * PURPOSE: Placeholder for forgot password functionality; currently not implemented.
 *
 * @function forgotPassword
 * @returns {Promise<void>}
 */
const handleForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();

  const { status, message } = await authService.generatePasswordResetToken(
    cleanEmail
  );

  baseController.logAction("forgot_password", req, {
    email: cleanEmail,
    status,
    message,
  });

  // Return different response based on status
  if (status === "recently requested") {
    return baseController.sendSuccess(
      res,
      { status, rateLimited: true },
      message ||
        "Email was already sent, please wait for 5 minutes before requesting again",
      200
    );
  }

  baseController.sendSuccess(
    res,
    { status },
    "If your email is registered, you will receive a password reset link shortly. Please wait up to 5 minutes before requesting again.",
    200
  );
}, "password_reset");

const handleValidateResetToken = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !token) {
    logger.error("Email or token missing for reset validation", {
      action: "validate_reset_token",
      email: cleanEmail || "missing",
      token: token || "missing",
    });
    createValidationError(
      "Email and token are required",
      {
        action: "validate_reset_token",
        email: cleanEmail || "missing",
        token: token || "missing",
      },
      "RESET_TOKEN_INVALID"
    );
  }

  const result = await authService.validateResetToken(cleanEmail, token);

  baseController.sendSuccess(res, result, "Reset token is valid", 200);
}, "validate_reset_token");

const handleResetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;
  // Only trim and lowercase email (don't sanitize it)
  const cleanEmail = email?.trim().toLowerCase();
  const sanitizedToken = sanitizeInput(token);

  if (!cleanEmail || !sanitizedToken || !newPassword) {
    logger.error("Missing fields for password reset", {
      action: "reset_password",
      email: cleanEmail || "missing",
      token: sanitizedToken || "missing",
      newPassword: newPassword ? "provided" : "missing",
    });
    throw createValidationError(
      "Email, token, and new password are required",
      {
        action: "reset_password",
        email: cleanEmail || "missing",
        token: sanitizedToken || "missing",
        newPassword: newPassword ? "provided" : "missing",
      },
      "RESET_TOKEN_INVALID"
    );
  }

  await authService.resetPassword(cleanEmail, sanitizedToken, newPassword);

  baseController.logAction("reset_password", req, { email: cleanEmail });
  baseController.sendSuccess(res, {}, "Password reset successfully", 200);
}, "reset_password");

module.exports = {
  register,
  login,
  logout,
  handleTokenRefresh,
  resendVerificationEmail,
  verifyEmail,
  handleForgotPassword,
  handleValidateResetToken,
  handleResetPassword,
};
