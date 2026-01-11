const express = require("express");

const {
  register,
  login,
  logout,
  handleTokenRefresh,
  resendVerificationEmail,
  verifyEmail,
  handleForgotPassword,
  handleValidateResetToken,
  handleResetPassword,
} = require("../../controllers/user");
const {
  validateRegister,
  validateLogin,
} = require("../../middleware/validations/user/auth.validation");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  emailLimiter,
  passwordResetLimiter,
} = require("../../middleware/limiters.middleware");

/**
 * Authentication Routes
 *
 * PURPOSE: Handle user authentication, session management, email verification, and password reset
 * SCOPE: User registration, login, logout, token refresh, email verification, password reset
 * AUTHENTICATION: Mixed - public registration/login, protected logout
 * VALIDATION: All input data is validated before processing
 *
 * ROUTE STRUCTURE:
 * - /api/auth/register (public user registration)
 * - /api/auth/login (public user login)
 * - /api/auth/refresh-token (public token refresh)
 * - /api/auth/logout (protected user logout)
 * - /api/auth/resend-verification (public resend verification email)
 * - /api/auth/verify-email (public verify email address)
 * - /api/auth/forgot-password (public request password reset)
 * - /api/auth/validate-reset-token (public validate reset token)
 * - /api/auth/reset-password (public reset password)
 */

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    email, password, username, profile data
 */
router.post("/register", validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 * @body    email, password
 */
router.post("/login", validateLogin, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookies)
 */
router.post("/refresh-token", handleTokenRefresh);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 * @body    email
 * @ratelimit 3 requests per 15 minutes
 */
router.post("/resend-verification", emailLimiter, resendVerificationEmail);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address with token
 * @access  Public
 * @body    email, token
 */
router.post("/verify-email", verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @body    email
 * @ratelimit 5 requests per 15 minutes
 */
router.post("/forgot-password", passwordResetLimiter, handleForgotPassword);

/**
 * @route   POST /api/auth/validate-reset-token
 * @desc    Validate password reset token
 * @access  Public
 * @body    email, token
 */
router.post("/validate-reset-token", handleValidateResetToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    email, token, newPassword
 * @ratelimit 5 requests per 15 minutes
 */
router.post("/reset-password", passwordResetLimiter, handleResetPassword);

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(protect);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post("/logout", logout);

module.exports = router;
