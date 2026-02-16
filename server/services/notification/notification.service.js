const { Notification, User } = require("../../models");
const logger = require("../../utils/logger");
const {
  handleServiceError,
  handleNotFoundError,
  buildSort,
} = require("../base.service");
const { createValidationError } = require("../../utils/errors");
const {
  NotificationConfig,
  NotificationCategory,
} = require("../../utils/enums/notification.enum");
const { emitToUser } = require("../../socket");

/**
 * Create a notification for a user
 * @param {Object} notifData - { userId, type, title, message, data }
 * @returns {Object} Created notification document
 */
const createNotification = async (notifData) => {
  try {
    const { userId, type, title, message, data } = notifData;

    if (!userId || !type || !title || !message) {
      return createValidationError(
        "userId, type, title, and message are required to create a notification",
        { userId, type },
        "INVALID_NOTIFICATION_DATA"
      );
    }

    const config = NotificationConfig[type];
    if (!config) {
      return createValidationError(
        `Unknown notification type: ${type}`,
        { type },
        "INVALID_NOTIFICATION_TYPE"
      );
    }

    // Check user notification preferences
    const user = await User.findById(userId).select(
      "notificationPreferences email profile.username"
    );
    if (user?.notificationPreferences) {
      const prefs = user.notificationPreferences;

      // Global kill switch
      if (!prefs.enabled) {
        logger.debug("Notifications globally disabled for user", {
          userId: userId.toString(),
        });
        return null;
      }

      // Check category-level preference
      const categoryPref = prefs[config.category];
      if (categoryPref && !categoryPref.inApp) {
        logger.debug("In-app notifications disabled for category", {
          userId: userId.toString(),
          category: config.category,
        });
        return null;
      }
    }

    // Calculate expiry from config
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (config.ttlDays || 30));

    const notification = await Notification.create({
      userId,
      type,
      category: config.category,
      priority: config.priority,
      title,
      message,
      icon: config.icon,
      channels: config.channels,
      data: data || {},
      expiresAt,
    });

    logger.info("Notification created", {
      notificationId: notification._id.toString(),
      userId: userId.toString(),
      type,
      category: config.category,
    });

    // Push real-time notification via WebSocket (non-blocking)
    try {
      emitToUser(userId, "notification:new", {
        _id: notification._id,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        icon: notification.icon,
        data: notification.data,
        read: false,
        createdAt: notification.createdAt,
      });
    } catch (socketErr) {
      // Socket failure must never block notification creation
      logger.debug("Socket emit failed for notification", {
        notificationId: notification._id.toString(),
        userId: userId.toString(),
        error: socketErr.message,
      });
    }

    // Send email for critical notification types (async, non-blocking)
    if (config.channels.includes("email")) {
      const shouldSendEmail =
        !user?.notificationPreferences ||
        (user.notificationPreferences.enabled !== false &&
          (!user.notificationPreferences[config.category] ||
            user.notificationPreferences[config.category].email !== false));

      if (shouldSendEmail) {
        // Lazy-load to avoid circular dependency
        const { sendNotificationEmail } = require("../email.service");
        sendNotificationEmail({
          recipientEmail: user?.email,
          recipientName: user?.profile?.username,
          subject: title,
          type,
          title,
          message,
          data: data || {},
        }).catch((emailErr) =>
          logger.error("Failed to send notification email", {
            notificationId: notification._id.toString(),
            userId: userId.toString(),
            type,
            error: emailErr.message,
          })
        );
      } else {
        logger.debug("Email notification skipped - user preference disabled", {
          userId: userId.toString(),
          type,
          category: config.category,
        });
      }
    }

    return notification;
  } catch (error) {
    handleServiceError(error, "createNotification", {
      userId: notifData?.userId?.toString(),
      type: notifData?.type,
    });
  }
};

/**
 * Create notifications for multiple users at once
 * @param {Array<Object>} notifications - Array of notifData objects
 * @returns {Array} Created notification documents
 */
const createBulkNotifications = async (notifications) => {
  try {
    const results = await Promise.allSettled(
      notifications.map((notifData) => createNotification(notifData))
    );

    const successful = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      logger.warn("Some bulk notifications failed to create", {
        total: notifications.length,
        successful: successful.length,
        failed: failed.length,
      });
    }

    return successful;
  } catch (error) {
    handleServiceError(error, "createBulkNotifications", {
      count: notifications?.length,
    });
  }
};

/**
 * Get paginated notifications for a user
 * @param {String} userId - User ID
 * @param {Object} query - { page, limit, category, read, sort }
 * @returns {Object} { notifications, pagination, unreadCount }
 */
const getUserNotifications = async (userId, query = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      read,
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { userId, deletedAt: null };

    if (category && Object.values(NotificationCategory).includes(category)) {
      filter.category = category;
    }

    if (read !== undefined && read !== "") {
      filter.read = read === "true" || read === true;
    }

    // Build sort with allowed fields
    const sortObj = buildSort(query, [
      "createdAt",
      "priority",
      "read",
      "category",
    ]);

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
      Notification.getUnreadCount(userId),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      notifications,
      unreadCount,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  } catch (error) {
    handleServiceError(error, "getUserNotifications", {
      userId: userId.toString(),
    });
  }
};

/**
 * Get unread notification count for a user
 * @param {String} userId - User ID
 * @returns {Object} { unreadCount }
 */
const getUnreadCount = async (userId) => {
  try {
    const unreadCount = await Notification.getUnreadCount(userId);
    return { unreadCount };
  } catch (error) {
    handleServiceError(error, "getUnreadCount", {
      userId: userId.toString(),
    });
  }
};

/**
 * Mark a single notification as read
 * @param {String} userId - User ID (for ownership check)
 * @param {String} notificationId - Notification ID
 * @returns {Object} Updated notification
 */
const markAsRead = async (userId, notificationId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
      deletedAt: null,
    });

    if (!notification) {
      return handleNotFoundError(
        "Notification",
        "NOTIFICATION_NOT_FOUND",
        "mark_as_read",
        { userId: userId.toString(), notificationId }
      );
    }

    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  } catch (error) {
    handleServiceError(error, "markAsRead", {
      userId: userId.toString(),
      notificationId,
    });
  }
};

/**
 * Mark all unread notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Object} { modifiedCount }
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.markAllRead(userId);

    logger.info("Marked all notifications as read", {
      userId: userId.toString(),
      modifiedCount: result.modifiedCount,
    });

    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    handleServiceError(error, "markAllAsRead", {
      userId: userId.toString(),
    });
  }
};

/**
 * Soft-delete a single notification
 * @param {String} userId - User ID (for ownership check)
 * @param {String} notificationId - Notification ID
 * @returns {Object} Soft-deleted notification
 */
const deleteNotification = async (userId, notificationId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
      deletedAt: null,
    });

    if (!notification) {
      return handleNotFoundError(
        "Notification",
        "NOTIFICATION_NOT_FOUND",
        "delete_notification",
        { userId: userId.toString(), notificationId }
      );
    }

    notification.deletedAt = new Date();
    await notification.save();

    logger.info("Notification soft-deleted", {
      notificationId,
      userId: userId.toString(),
    });

    return notification;
  } catch (error) {
    handleServiceError(error, "deleteNotification", {
      userId: userId.toString(),
      notificationId,
    });
  }
};

/**
 * Soft-delete all read notifications for a user
 * @param {String} userId - User ID
 * @returns {Object} { modifiedCount }
 */
const deleteAllRead = async (userId) => {
  try {
    const result = await Notification.clearAllRead(userId);

    logger.info("Cleared all read notifications", {
      userId: userId.toString(),
      modifiedCount: result.modifiedCount,
    });

    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    handleServiceError(error, "deleteAllRead", {
      userId: userId.toString(),
    });
  }
};

/**
 * Hard-delete expired (past expiresAt) + soft-deleted notifications
 * Called by cleanup cron job
 * @returns {Object} { deletedCount }
 */
const cleanupExpiredNotifications = async () => {
  try {
    const now = new Date();

    const result = await Notification.deleteMany({
      $or: [{ expiresAt: { $lte: now } }, { deletedAt: { $ne: null } }],
    });

    logger.info("Expired notifications cleaned up", {
      deletedCount: result.deletedCount,
      timestamp: now.toISOString(),
    });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    handleServiceError(error, "cleanupExpiredNotifications");
  }
};

/**
 * Get notification preferences for a user
 * @param {String} userId - User ID
 * @returns {Object} User notification preferences
 */
const getNotificationPreferences = async (userId) => {
  try {
    const user = await User.findById(userId).select("notificationPreferences");
    if (!user) {
      return handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "get_notification_preferences",
        { userId: userId.toString() }
      );
    }

    return {
      preferences: user.notificationPreferences || {
        enabled: true,
        order: { inApp: true, email: true },
        shopping: { inApp: true, email: false },
        merchant: { inApp: true, email: true },
        quote: { inApp: true, email: true },
        system: { inApp: true, email: true },
        admin: { inApp: true, email: false },
      },
    };
  } catch (error) {
    handleServiceError(error, "getNotificationPreferences", {
      userId: userId.toString(),
    });
  }
};

/**
 * Update notification preferences for a user
 * @param {String} userId - User ID
 * @param {Object} preferences - Updated preference fields
 * @returns {Object} Updated preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const user = await User.findById(userId).select("notificationPreferences");
    if (!user) {
      return handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "update_notification_preferences",
        { userId: userId.toString() }
      );
    }

    // Merge incoming preferences with existing ones
    const validCategories = Object.values(NotificationCategory);
    const current = user.notificationPreferences || {};

    if (preferences.enabled !== undefined) {
      current.enabled = Boolean(preferences.enabled);
    }

    for (const cat of validCategories) {
      if (preferences[cat]) {
        if (!current[cat]) {
          current[cat] = { inApp: true, email: false };
        }
        if (preferences[cat].inApp !== undefined) {
          current[cat].inApp = Boolean(preferences[cat].inApp);
        }
        if (preferences[cat].email !== undefined) {
          current[cat].email = Boolean(preferences[cat].email);
        }
      }
    }

    user.notificationPreferences = current;
    await user.save();

    logger.info("Notification preferences updated", {
      userId: userId.toString(),
    });

    return { preferences: user.notificationPreferences };
  } catch (error) {
    handleServiceError(error, "updateNotificationPreferences", {
      userId: userId.toString(),
    });
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  cleanupExpiredNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
};
