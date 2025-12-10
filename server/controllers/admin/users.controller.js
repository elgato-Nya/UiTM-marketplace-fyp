const BaseController = require("../base.controller");
const asyncHandler = require("../../utils/asyncHandler");
const {
  getAllUsers,
  getUserStatistics,
  getUserById,
  updateUserStatus,
  updateUserRoles,
  verifyUserEmail,
  resetUserPassword,
  searchUsers,
  bulkUpdateUsers,
  getUserActivity,
} = require("../../services/admin/users.service");
const { AppError } = require("../../utils/errors");

/**
 * Admin User Management Controller
 *
 * PURPOSE: Handle HTTP requests for admin user management
 * ENDPOINTS:
 * - GET /api/admin/users - List all users with filters
 * - GET /api/admin/users/stats - Get user statistics
 * - GET /api/admin/users/:id - Get user details
 * - GET /api/admin/users/:id/activity - Get user activity logs
 * - PATCH /api/admin/users/:id/status - Update user status (suspend/activate)
 * - PATCH /api/admin/users/:id/roles - Update user roles
 * - POST /api/admin/users/:id/verify - Manually verify user email
 * - POST /api/admin/users/:id/reset-password - Admin password reset
 * - POST /api/admin/users/bulk - Bulk update users
 */

const baseController = new BaseController();

/**
 * Get all users with filters and pagination
 * GET /api/admin/users?role=consumer&status=active&page=1&limit=20&search=john
 * Supports multi-select: role=consumer&role=admin or role[]=consumer&role[]=admin
 */
const handleGetAllUsers = asyncHandler(async (req, res) => {
  const { role, status, campus, verified, search, page, limit } = req.query;

  // Handle array parameters (role, status, campus can be arrays for multi-select)
  const filters = {
    role: Array.isArray(role) ? role : role ? [role] : undefined,
    status: Array.isArray(status) ? status : status ? [status] : undefined,
    campus: Array.isArray(campus) ? campus : campus ? [campus] : undefined,
    verified,
    search,
  };

  const pagination = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  };

  const result = await getAllUsers(filters, pagination);

  baseController.logAction("getAllUsers", req, {
    filters,
    resultCount: result.data?.users?.length || 0,
  });

  return baseController.sendSuccess(res, result.data);
}, "get_all_users");

/**
 * Get user statistics
 * GET /api/admin/users/stats
 */
const handleGetUserStats = asyncHandler(async (req, res) => {
  const stats = await getUserStatistics();

  baseController.logAction("getUserStats", req, { totalUsers: stats.total });

  return baseController.sendSuccess(res, stats);
}, "get_user_stats");

/**
 * Get single user details
 * GET /api/admin/users/:id
 */
const handleGetUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await getUserById(id);

  baseController.logAction("getUserById", req, { userId: id });

  return baseController.sendSuccess(res, { user });
}, "get_user_by_id");

/**
 * Update user status (suspend/activate)
 * PATCH /api/admin/users/:id/status
 * Body: { suspend: true/false, reason: "..." }
 */
const handleUpdateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { suspend, reason } = req.body;
  const adminId = req.user._id;

  if (suspend === undefined) {
    throw new AppError("Suspend status is required", 400);
  }

  if (suspend && !reason) {
    throw new AppError("Reason is required for suspension", 400);
  }

  const user = await updateUserStatus(id, suspend, reason, adminId);

  baseController.logAction("updateUserStatus", req, {
    userId: id,
    suspend,
    reason,
  });

  return baseController.sendSuccess(
    res,
    { user },
    suspend ? "User suspended successfully" : "User activated successfully"
  );
}, "update_user_status");

/**
 * Update user roles
 * PATCH /api/admin/users/:id/roles
 * Body: { roles: ["consumer", "merchant"] }
 */
const handleUpdateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  const adminId = req.user._id;

  if (!Array.isArray(roles) || roles.length === 0) {
    throw new AppError("Valid roles array is required", 400);
  }

  const user = await updateUserRoles(id, roles, adminId);

  baseController.logAction("updateUserRoles", req, {
    userId: id,
    newRoles: roles,
  });

  return baseController.sendSuccess(
    res,
    { user },
    "User roles updated successfully"
  );
}, "update_user_roles");

/**
 * Manually verify user email
 * POST /api/admin/users/:id/verify
 */
const handleVerifyUserEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const user = await verifyUserEmail(id, adminId);

  baseController.logAction("verifyUserEmail", req, { userId: id });

  return baseController.sendSuccess(
    res,
    { user },
    "Email verified successfully"
  );
}, "verify_user_email");

/**
 * Admin password reset
 * POST /api/admin/users/:id/reset-password
 */
const handleResetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const result = await resetUserPassword(id, adminId);

  baseController.logAction("resetUserPassword", req, { userId: id });

  // TODO: Send email with temporary password
  // For now, return in response (security consideration: use email in production)

  return baseController.sendSuccess(
    res,
    {
      user: result.user,
      tempPassword: result.tempPassword,
      message: "Send this password to user via secure channel",
    },
    "Password reset successfully"
  );
}, "reset_user_password");

/**
 * Get user activity logs
 * GET /api/admin/users/:id/activity
 */
const handleGetUserActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, startDate, endDate } = req.query;

  const filters = { type, startDate, endDate };
  const activity = await getUserActivity(id, filters);

  baseController.logAction("getUserActivity", req, { userId: id });

  return baseController.sendSuccess(res, activity);
}, "get_user_activity");

/**
 * Search users
 * GET /api/admin/users/search?q=john&role=consumer
 */
const handleSearchUsers = asyncHandler(async (req, res) => {
  const { q, role, status } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError("Search query must be at least 2 characters", 400);
  }

  const filters = { role, status };
  const users = await searchUsers(q, filters);

  baseController.logAction("searchUsers", req, {
    query: q,
    resultCount: users.length,
  });

  return baseController.sendSuccess(res, { users, count: users.length });
}, "search_users");

/**
 * Bulk update users
 * POST /api/admin/users/bulk
 * Body: { userIds: [...], action: { type: "suspend", reason: "..." } }
 */
const handleBulkUpdateUsers = asyncHandler(async (req, res) => {
  const { userIds, action } = req.body;
  const adminId = req.user._id;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError("User IDs array is required", 400);
  }

  if (!action || !action.type) {
    throw new AppError("Action type is required", 400);
  }

  const validActions = ["suspend", "activate", "verify"];
  if (!validActions.includes(action.type)) {
    throw new AppError(
      `Invalid action type. Must be one of: ${validActions.join(", ")}`,
      400
    );
  }

  if (action.type === "suspend" && !action.reason) {
    throw new AppError("Reason is required for bulk suspension", 400);
  }

  const results = await bulkUpdateUsers(userIds, action, adminId);

  baseController.logAction("bulkUpdateUsers", req, {
    action: action.type,
    userCount: userIds.length,
    successCount: results.success.length,
    failedCount: results.failed.length,
  });

  return baseController.sendSuccess(
    res,
    results,
    `Bulk ${action.type} completed: ${results.success.length} succeeded, ${results.failed.length} failed`
  );
}, "bulk_update_users");

module.exports = {
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
};
