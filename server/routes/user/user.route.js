const express = require("express");

const { getMe, updateMe } = require("../../controllers/user");
const {
  validateUpdateMe,
} = require("../../middleware/validations/user/user.validation");
const { protect } = require("../../middleware/auth/auth.middleware");
const { standardLimiter } = require("../../middleware/limiters.middleware");

/**
 * User Profile Routes
 *
 * PURPOSE: Handle user profile management and personal data operations
 * SCOPE: User profile retrieval, profile updates, personal settings
 * AUTHENTICATION: All routes require authentication
 * VALIDATION: Profile update data is validated before processing
 * RATE LIMITING: standardLimiter (100 requests per 15 minutes)
 *
 * ROUTE STRUCTURE:
 * - /api/users/me (current user profile operations)
 *
 * SECURITY: Users can only access and modify their own profile data
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and rate limiting middleware to all routes
router.use(protect);
router.use(standardLimiter);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile information
 * @access  Private
 * @returns User profile data (excluding sensitive fields)
 */
router.get("/me", getMe);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile information
 * @access  Private
 * @body    username, profile data (bio, avatar, phone, etc.)
 * @note    Sensitive fields like email, password require separate endpoints
 */
router.patch("/me", validateUpdateMe, updateMe);

module.exports = router;
