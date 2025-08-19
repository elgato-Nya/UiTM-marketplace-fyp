const express = require("express");

const {
  register,
  login,
  logout,
  handleTokenRefresh,
  // forgotPassword, // TODO: implement forgot password
} = require("../../controllers/user");
const {
  validateRegister,
  validateLogin,
  // validateForgotPassword, // TODO: implement forgot password
} = require("../../middleware/validations/user/auth.validation");
const { protect } = require("../../middleware/auth/auth.middleware");

/**
 * Authentication Routes
 *
 * PURPOSE: Handle user authentication and session management
 * SCOPE: User registration, login, logout, token refresh
 * AUTHENTICATION: Mixed - public registration/login, protected logout
 * VALIDATION: All input data is validated before processing
 *
 * ROUTE STRUCTURE:
 * - /api/auth/register (public user registration)
 * - /api/auth/login (public user login)
 * - /api/auth/refresh-token (public token refresh)
 * - /api/auth/logout (protected user logout)
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

// TODO: Implement forgot password functionality
// router.post("/forgot-password", validateForgotPassword, forgotPassword);

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
