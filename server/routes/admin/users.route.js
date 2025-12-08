const express = require("express");
const router = express.Router();
const {
  handleGetAllUsers,
  handleGetUserStats,
  handleGetUserById,
  handleUpdateUserStatus,
  handleUpdateUserRoles,
  handleVerifyUserEmail,
  handleResetUserPassword,
  handleGetUserActivity,
  handleSearchUsers,
  handleBulkUpdateUsers,
} = require("../../controllers/admin/users.controller");
const { protect, authorize } = require("../../middleware/auth");
const {
  validateUserId,
  validateUpdateStatus,
  validateUpdateRoles,
  validateFilters,
  validateSearch,
  validateBulkUpdate,
} = require("../../middleware/validations/admin/users.validation");
const {
  createRateLimiter,
} = require("../../middleware/rateLimiter.middleware");

// Rate limiters
const standardLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window (for sensitive operations)
  message: "Too many requests, please try again later",
});

/**
 * Apply middleware to all routes
 * - Authentication required
 * - Admin role required
 * - Rate limiting
 */
router.use(protect);
router.use(authorize("admin"));
router.use(standardLimiter);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Admin only
 */
router.get("/stats", handleGetUserStats);

/**
 * @route   GET /api/admin/users/search
 * @desc    Search users with fuzzy matching
 * @access  Admin only
 */
router.get("/search", validateSearch, handleSearchUsers);

/**
 * @route   POST /api/admin/users/bulk
 * @desc    Bulk update users (suspend/activate/verify)
 * @access  Admin only
 */
router.post("/bulk", strictLimiter, validateBulkUpdate, handleBulkUpdateUsers);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Admin only
 */
router.get("/", validateFilters, handleGetAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Admin only
 */
router.get("/:id", validateUserId, handleGetUserById);

/**
 * @route   GET /api/admin/users/:id/activity
 * @desc    Get user activity logs
 * @access  Admin only
 */
router.get("/:id/activity", validateUserId, handleGetUserActivity);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (suspend/activate)
 * @access  Admin only
 */
router.patch(
  "/:id/status",
  strictLimiter,
  validateUpdateStatus,
  handleUpdateUserStatus
);

/**
 * @route   PATCH /api/admin/users/:id/roles
 * @desc    Update user roles
 * @access  Admin only
 */
router.patch(
  "/:id/roles",
  strictLimiter,
  validateUpdateRoles,
  handleUpdateUserRoles
);

/**
 * @route   POST /api/admin/users/:id/verify
 * @desc    Manually verify user email
 * @access  Admin only
 */
router.post(
  "/:id/verify",
  strictLimiter,
  validateUserId,
  handleVerifyUserEmail
);

/**
 * @route   POST /api/admin/users/:id/reset-password
 * @desc    Admin password reset
 * @access  Admin only
 */
router.post(
  "/:id/reset-password",
  strictLimiter,
  validateUserId,
  handleResetUserPassword
);

module.exports = router;
