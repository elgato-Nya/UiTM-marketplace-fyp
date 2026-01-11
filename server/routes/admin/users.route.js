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
  adminStandardLimiter,
  adminStrictLimiter,
} = require("../../middleware/limiters.middleware");

/**
 * Apply middleware to all routes
 * - Authentication required
 * - Admin role required
 * - Rate limiting (centralized)
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */
router.use(protect);
router.use(authorize("admin"));
router.use(adminStandardLimiter);

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
router.post(
  "/bulk",
  adminStrictLimiter,
  validateBulkUpdate,
  handleBulkUpdateUsers
);

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
  adminStrictLimiter,
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
  adminStrictLimiter,
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
  adminStrictLimiter,
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
  adminStrictLimiter,
  validateUserId,
  handleResetUserPassword
);

module.exports = router;
