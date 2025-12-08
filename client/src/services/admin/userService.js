import api from "../api";

/**
 * Admin User Management Service
 *
 * PURPOSE: Handle API calls for admin user management operations
 */

const BASE_URL = "/admin/users";

/**
 * Get list of users with filters and pagination
 * @param {Object} params - Query parameters
 * @param {string|Array} params.role - Filter by role (all/consumer/merchant/admin or array for multi-select)
 * @param {string|Array} params.status - Filter by status (all/active/inactive/suspended or array for multi-select)
 * @param {string|Array} params.campus - Filter by campus (or array for multi-select)
 * @param {boolean} params.verified - Filter by email verification status
 * @param {string} params.search - Search term (username, email, studentId)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field (createdAt/lastActive/username)
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Users list with pagination
 */
export const getAllUsers = async (params = {}) => {
  const {
    role = "all",
    status = "all",
    campus = "",
    verified,
    search = "",
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  // Handle role filter (single value, array, or "all")
  if (Array.isArray(role) && role.length > 0) {
    role.forEach((r) => queryParams.append("role", r));
  } else if (role && role !== "all" && !Array.isArray(role)) {
    queryParams.append("role", role);
  }

  // Handle status filter (single value, array, or "all")
  if (Array.isArray(status) && status.length > 0) {
    status.forEach((s) => queryParams.append("status", s));
  } else if (status && status !== "all" && !Array.isArray(status)) {
    queryParams.append("status", status);
  }

  // Handle campus filter (single value, array, or empty)
  if (Array.isArray(campus) && campus.length > 0) {
    campus.forEach((c) => queryParams.append("campus", c));
  } else if (campus && !Array.isArray(campus)) {
    queryParams.append("campus", campus);
  }
  if (typeof verified === "boolean") {
    queryParams.append("verified", verified.toString());
  }
  if (search) {
    queryParams.append("search", search);
  }

  const response = await api.get(`${BASE_URL}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get user statistics for dashboard
 * @returns {Promise<Object>} User statistics (total, active, suspended, unverified, by role, by campus)
 */
export const getUserStats = async () => {
  const response = await api.get(`${BASE_URL}/stats`);
  return response.data;
};

/**
 * Get single user details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details
 */
export const getUserById = async (userId) => {
  const response = await api.get(`${BASE_URL}/${userId}`);
  return response.data;
};

/**
 * Get user activity logs
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} User activity logs with pagination
 */
export const getUserActivity = async (userId, params = {}) => {
  const { page = 1, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await api.get(
    `${BASE_URL}/${userId}/activity?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Update user status (suspend or activate)
 * @param {string} userId - User ID
 * @param {boolean} suspend - True to suspend, false to activate
 * @param {string} reason - Reason for status change (required for suspension)
 * @returns {Promise<Object>} Success response
 */
export const updateUserStatus = async (userId, suspend, reason = "") => {
  const response = await api.patch(`${BASE_URL}/${userId}/status`, {
    suspend,
    reason,
  });
  return response.data;
};

/**
 * Update user roles
 * @param {string} userId - User ID
 * @param {string[]} roles - Array of roles (consumer/merchant/admin)
 * @returns {Promise<Object>} Success response
 */
export const updateUserRoles = async (userId, roles) => {
  const response = await api.patch(`${BASE_URL}/${userId}/roles`, { roles });
  return response.data;
};

/**
 * Manually verify user email
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success response
 */
export const verifyUserEmail = async (userId) => {
  const response = await api.post(`${BASE_URL}/${userId}/verify`);
  return response.data;
};

/**
 * Reset user password (generates temporary password)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success response with temporary password
 */
export const resetUserPassword = async (userId) => {
  const response = await api.post(`${BASE_URL}/${userId}/reset-password`);
  return response.data;
};

/**
 * Perform bulk operations on multiple users
 * @param {Object} data - Bulk operation data
 * @param {string[]} data.userIds - Array of user IDs (max 50)
 * @param {string} data.action - Action to perform (suspend/activate/verify)
 * @param {string} data.reason - Reason (required for suspend action)
 * @returns {Promise<Object>} Bulk operation results
 */
export const bulkUpdateUsers = async (data) => {
  const { userIds, action, reason = "" } = data;
  const response = await api.post(`${BASE_URL}/bulk`, {
    userIds,
    action,
    reason,
  });
  return response.data;
};

const adminUserService = {
  getAllUsers,
  getUserStats,
  getUserById,
  getUserActivity,
  updateUserStatus,
  updateUserRoles,
  verifyUserEmail,
  resetUserPassword,
  bulkUpdateUsers,
};

export default adminUserService;
