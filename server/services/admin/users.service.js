const { User } = require("../../models/user");
const logger = require("../../utils/logger");
const { AppError } = require("../../utils/errors");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const Fuse = require("fuse.js");

/**
 * Admin User Management Service - Functional Programming Pattern
 *
 * PURPOSE: Handle all admin operations for user management
 * FEATURES:
 * - List users with advanced filters
 * - Search users with fuzzy matching
 * - Update user status (suspend/activate)
 * - Update user roles
 * - Manual email verification
 * - Admin password reset
 * - User activity tracking
 * - Bulk operations
 * - Statistics
 */

/**
 * Get all users with filters and pagination
 * @param {Object} filters - Filter criteria (role, status, campus, verified, search)
 * @param {Object} pagination - Page and limit
 * @returns {Object} Users list and pagination info
 */
const getAllUsers = async (filters = {}, pagination = {}) => {
  try {
    const { role, status, campus, verified, search } = filters;
    const { page = 1, limit = 20 } = pagination;

    // Build query
    const query = {};

    // Filter by role (supports array for multi-select)
    if (role && Array.isArray(role) && role.length > 0) {
      // Multi-select: user must have at least one of the selected roles
      query.roles = { $in: role };
    } else if (role && !Array.isArray(role) && role !== "all") {
      // Single select
      query.roles = role;
    }

    // Filter by status (supports array for multi-select)
    if (status && Array.isArray(status) && status.length > 0) {
      // Multi-select: build OR conditions
      const statusConditions = [];
      if (status.includes("suspended")) {
        statusConditions.push({ isSuspended: true });
      }
      if (status.includes("active")) {
        statusConditions.push({
          isSuspended: { $ne: true },
          isActive: true,
        });
      }
      if (status.includes("inactive")) {
        // Inactive users: not suspended but haven't been active in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        statusConditions.push({
          isSuspended: { $ne: true },
          $or: [
            { lastActivityAt: { $lt: thirtyDaysAgo } },
            { lastActivityAt: { $exists: false } },
            { isActive: false },
          ],
        });
      }
      if (statusConditions.length > 0) {
        query.$or = statusConditions;
      }
    } else if (status && !Array.isArray(status)) {
      // Single select - original logic
      if (status === "suspended") {
        query.isSuspended = true;
      } else if (status === "active") {
        query.isSuspended = { $ne: true };
        query.isActive = true;
      } else if (status === "inactive") {
        // Inactive users: not suspended but haven't been active in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        query.isSuspended = { $ne: true };
        query.$or = [
          { lastActivityAt: { $lt: thirtyDaysAgo } },
          { lastActivityAt: { $exists: false } },
          { isActive: false },
        ];
      }
    }

    // Filter by campus (supports array for multi-select)
    if (campus && Array.isArray(campus) && campus.length > 0) {
      query["profile.campus"] = { $in: campus };
    } else if (campus && !Array.isArray(campus) && campus !== "all") {
      query["profile.campus"] = campus;
    }

    // Filter by email verification
    if (verified !== undefined) {
      query["emailVerification.isVerified"] =
        verified === "true" || verified === true;
    }

    let users = [];
    let total = 0;

    // If search exists, use Fuse.js for fuzzy search
    if (search && search.trim()) {
      // Get all users matching the filters
      const allUsers = await User.find(query)
        .select(
          "email profile roles emailVerification.isVerified isSuspended isActive " +
            "suspendedAt suspendedBy suspensionReason lastActive lastActivityAt " +
            "createdAt updatedAt"
        )
        .populate("suspendedBy", "profile.username email")
        .sort({ createdAt: -1 })
        .lean();

      // Configure Fuse.js for fuzzy search
      const fuseOptions = {
        keys: [
          { name: "profile.username", weight: 0.4 },
          { name: "email", weight: 0.3 },
          { name: "profile.studentId", weight: 0.3 },
        ],
        threshold: 0.4,
        distance: 100,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      };

      const fuse = new Fuse(allUsers, fuseOptions);
      const searchResults = fuse.search(search.trim());

      // Extract users from Fuse results
      const searchedUsers = searchResults.map((result) => result.item);

      // Apply pagination
      total = searchedUsers.length;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      users = searchedUsers.slice(skip, skip + parseInt(limit));
    } else {
      // No search: standard query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      [users, total] = await Promise.all([
        User.find(query)
          .select(
            "email profile roles emailVerification.isVerified isSuspended isActive " +
              "suspendedAt suspendedBy suspensionReason lastActive lastActivityAt " +
              "createdAt updatedAt"
          )
          .populate("suspendedBy", "profile.username email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(query),
      ]);
    }

    logger.info("Users retrieved successfully", {
      service: "AdminUserService",
      filters,
      count: users.length,
      total,
    });

    return {
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1,
        },
      },
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Get All Users");
  }
};

/**
 * Get user statistics
 * @param {Object} filters - Optional filters
 * @returns {Object} User statistics
 */
const getUserStatistics = async (filters = {}) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      isSuspended: { $ne: true },
    });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const unverifiedUsers = await User.countDocuments({
      "emailVerification.isVerified": false,
    });

    // Users by role
    const consumers = await User.countDocuments({ roles: "consumer" });
    const merchants = await User.countDocuments({ roles: "merchant" });
    const admins = await User.countDocuments({ roles: "admin" });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Users by campus
    const usersByCampus = await User.aggregate([
      { $match: { "profile.campus": { $exists: true } } },
      { $group: { _id: "$profile.campus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    logger.info("User statistics retrieved", {
      service: "AdminUserService",
      totalUsers,
    });

    return {
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        unverified: unverifiedUsers,
        byRole: {
          consumers,
          merchants,
          admins,
        },
        recentRegistrations,
        byCampus: usersByCampus,
      },
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Get Statistics");
  }
};

/**
 * Get single user details by ID
 * @param {String} userId - User ID
 * @returns {Object} User details
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select(
        "email profile roles emailVerification.isVerified isSuspended " +
          "suspendedAt suspendedBy suspensionReason lastActivityAt " +
          "merchantDetails createdAt updatedAt"
      )
      .populate("suspendedBy", "profile.username email")
      .lean();

    if (!user) {
      return handleNotFoundError("User");
    }

    logger.info("User details retrieved", {
      service: "AdminUserService",
      userId,
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Get User By ID");
  }
};

/**
 * Update user status (suspend/activate)
 * @param {String} userId - User ID
 * @param {Boolean} suspend - True to suspend, false to activate
 * @param {String} reason - Reason for status change
 * @param {String} adminId - Admin who performed the action
 * @returns {Object} Updated user
 */
const updateUserStatus = async (userId, suspend, reason, adminId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return handleNotFoundError("User");
    }

    // Prevent admins from suspending themselves
    if (userId.toString() === adminId.toString()) {
      throw new AppError("Cannot suspend your own account", 400);
    }

    // Prevent suspending super admins
    if (user.roles.includes("admin") && suspend) {
      throw new AppError("Cannot suspend admin users", 403);
    }

    if (suspend) {
      // Suspend user
      user.isSuspended = true;
      user.suspendedAt = new Date();
      user.suspendedBy = adminId;
      user.suspensionReason = reason || "No reason provided";
    } else {
      // Activate user
      user.isSuspended = false;
      user.suspendedAt = null;
      user.suspendedBy = null;
      user.suspensionReason = null;
    }

    await user.save();

    logger.info(`User ${suspend ? "suspended" : "activated"}`, {
      service: "AdminUserService",
      userId,
      adminId,
      reason,
    });

    return {
      success: true,
      data: user,
      message: `User ${suspend ? "suspended" : "activated"} successfully`,
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Update Status");
  }
};

/**
 * Update user roles
 * @param {String} userId - User ID
 * @param {Array} roles - New roles array
 * @param {String} adminId - Admin who performed the action
 * @returns {Object} Updated user
 */
const updateUserRoles = async (userId, roles, adminId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return handleNotFoundError("User");
    }

    // Prevent admins from modifying their own roles
    if (userId.toString() === adminId.toString()) {
      throw new AppError("Cannot modify your own roles", 400);
    }

    // Validate roles
    const validRoles = ["consumer", "merchant", "admin"];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new AppError(`Invalid roles: ${invalidRoles.join(", ")}`, 400);
    }

    // Ensure at least one role
    if (roles.length === 0) {
      throw new AppError("User must have at least one role", 400);
    }

    const oldRoles = [...user.roles];
    user.roles = roles;

    // If admin role is being added and user doesn't have adminLevel, set default
    if (roles.includes("admin") && !user.adminLevel) {
      user.adminLevel = "moderator"; // Default to moderator level
      logger.info("Setting default adminLevel to moderator", {
        userId,
        roles,
      });
    }

    // If admin role is being removed, remove adminLevel
    if (!roles.includes("admin") && user.adminLevel) {
      user.adminLevel = undefined;
      logger.info("Removing adminLevel as admin role removed", {
        userId,
        oldRoles,
        newRoles: roles,
      });
    }

    await user.save();

    logger.info("User roles updated", {
      service: "AdminUserService",
      userId,
      oldRoles,
      newRoles: roles,
      adminLevel: user.adminLevel,
      adminId,
    });

    return {
      success: true,
      data: user,
      message: "User roles updated successfully",
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Update Roles");
  }
};

/**
 * Manually verify user email
 * @param {String} userId - User ID
 * @param {String} adminId - Admin who performed the action
 * @returns {Object} Updated user
 */
const verifyUserEmail = async (userId, adminId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return handleNotFoundError("User");
    }

    if (user.emailVerification?.isVerified) {
      throw new AppError("Email already verified", 400);
    }

    user.emailVerification.isVerified = true;
    user.emailVerification.verifiedAt = new Date();
    await user.save();

    logger.info("User email manually verified by admin", {
      service: "AdminUserService",
      userId,
      adminId,
    });

    return {
      success: true,
      data: user,
      message: "User email verified successfully",
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Verify Email");
  }
};

/**
 * Admin password reset (generate new password)
 * @param {String} userId - User ID
 * @param {String} adminId - Admin who performed the action
 * @returns {Object} New temporary password and user
 */
const resetUserPassword = async (userId, adminId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return handleNotFoundError("User");
    }

    // Prevent admins from resetting other admin passwords
    if (user.roles.includes("admin") && userId !== adminId) {
      throw new AppError("Cannot reset admin user passwords", 403);
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    user.password = tempPassword; // Will be hashed by pre-save hook
    user.requirePasswordChange = true; // Flag for forced password change on next login
    await user.save();

    logger.info("User password reset by admin", {
      service: "AdminUserService",
      userId,
      adminId,
    });

    // Return temp password (send via email in controller)
    return {
      success: true,
      data: {
        user,
        tempPassword,
      },
      message: "Password reset successfully",
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Reset Password");
  }
};

/**
 * Search users with fuzzy matching
 * @param {String} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Array} Matching users
 */
const searchUsers = async (query, filters = {}) => {
  try {
    if (!query || !query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    const baseQuery = {};

    // Apply filters
    if (filters.role && filters.role !== "all") {
      baseQuery.roles = filters.role;
    }
    if (filters.status === "suspended") {
      baseQuery.isSuspended = true;
    } else if (filters.status === "active") {
      baseQuery.isSuspended = { $ne: true };
    }
    // Get all users matching base filters
    const allUsers = await User.find(baseQuery)
      .select(
        "email profile roles emailVerification.isVerified isSuspended createdAt"
      )
      .limit(100) // Limit for performance
      .lean();

    // Apply Fuse.js fuzzy search
    const fuseOptions = {
      keys: ["profile.username", "email", "profile.studentId"],
      threshold: 0.4,
      includeScore: true,
    };

    const fuse = new Fuse(allUsers, fuseOptions);
    const results = fuse.search(query.trim());

    logger.info(`User search completed for "${query}"`, {
      service: "AdminUserService",
      resultsCount: results.length,
    });

    return {
      success: true,
      data: results.map((result) => result.item),
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Search Users");
  }
};

/**
 * Bulk update users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} action - Action to perform (suspend/activate/verify)
 * @param {String} adminId - Admin who performed the action
 * @returns {Object} Result of bulk operation
 */
const bulkUpdateUsers = async (userIds, action, adminId) => {
  try {
    // Limit bulk operations
    if (userIds.length > 50) {
      throw new AppError("Cannot update more than 50 users at once", 400);
    }

    // Prevent admin from including themselves
    const adminIdString = adminId.toString();
    if (userIds.some((id) => id.toString() === adminIdString)) {
      throw new AppError("Cannot perform bulk action on your own account", 400);
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const userId of userIds) {
      try {
        let result;
        switch (action.type) {
          case "suspend":
            result = await updateUserStatus(
              userId,
              true,
              action.reason,
              adminId
            );
            if (result.success) {
              results.success.push(userId);
            } else {
              results.failed.push({ userId, error: result.message });
            }
            break;
          case "activate":
            result = await updateUserStatus(userId, false, null, adminId);
            if (result.success) {
              results.success.push(userId);
            } else {
              results.failed.push({ userId, error: result.message });
            }
            break;
          case "verify":
            result = await verifyUserEmail(userId, adminId);
            if (result.success) {
              results.success.push(userId);
            } else {
              results.failed.push({ userId, error: result.message });
            }
            break;
          default:
            results.failed.push({ userId, error: "Invalid action type" });
        }
      } catch (error) {
        results.failed.push({ userId, error: error.message });
      }
    }

    logger.info("Bulk user update completed", {
      service: "AdminUserService",
      action: action.type,
      success: results.success.length,
      failed: results.failed.length,
      adminId,
    });

    return {
      success: true,
      data: results,
      message: `Bulk operation completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Bulk Update");
  }
};

/**
 * Get user activity logs
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Object} Activity logs
 */
const getUserActivity = async (userId, filters = {}) => {
  try {
    // Get user details
    const userResult = await getUserById(userId);
    if (!userResult.success) {
      return userResult;
    }

    const user = userResult.data;

    // TODO: Implement comprehensive activity logging system
    // For now, return basic user info and key events
    const activities = [
      {
        action: "account_created",
        timestamp: user.createdAt,
        details: "User account created",
      },
    ];

    if (user.lastActivityAt) {
      activities.push({
        action: "last_activity",
        timestamp: user.lastActivityAt,
        details: "Last activity recorded",
      });
    }

    if (user.suspendedAt) {
      activities.push({
        action: "account_suspended",
        timestamp: user.suspendedAt,
        details: user.suspensionReason,
      });
    }

    logger.info("User activity retrieved", {
      service: "AdminUserService",
      userId,
      activityCount: activities.length,
    });

    return {
      success: true,
      data: {
        userId,
        activities: activities.filter(Boolean),
      },
    };
  } catch (error) {
    return handleServiceError(error, "Admin Users Service - Get Activity");
  }
};

// Export all service functions
module.exports = {
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
};
