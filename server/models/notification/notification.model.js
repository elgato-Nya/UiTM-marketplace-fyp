const mongoose = require("mongoose");

const {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationConfig,
} = require("../../utils/enums/notification.enum");
const logger = require("../../utils/logger");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user"],
      index: true,
    },

    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: Object.values(NotificationType),
        message: "Invalid notification type: {VALUE}",
      },
      index: true,
    },

    category: {
      type: String,
      required: [true, "Notification category is required"],
      enum: {
        values: Object.values(NotificationCategory),
        message: "Invalid notification category: {VALUE}",
      },
      index: true,
    },

    priority: {
      type: String,
      enum: {
        values: Object.values(NotificationPriority),
        message: "Invalid priority level: {VALUE}",
      },
      default: NotificationPriority.NORMAL,
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    icon: {
      type: String,
      trim: true,
      default: "🔔",
    },

    // Flexible metadata for linking to relevant resources
    data: {
      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "data.referenceModel",
      },
      referenceModel: {
        type: String,
        enum: ["Order", "Listing", "QuoteRequest", "User"],
      },
      actionUrl: {
        type: String,
        trim: true,
      },
      extra: {
        type: mongoose.Schema.Types.Mixed,
      },
    },

    // Delivery tracking
    channels: {
      type: [String],
      enum: ["in_app", "email"],
      default: ["in_app"],
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    // Read state
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Soft delete support
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Auto-expiry based on NotificationConfig TTL
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== COMPOUND INDEXES ====================

// Primary query: user's active (non-deleted) notifications sorted by newest
notificationSchema.index(
  { userId: 1, deletedAt: 1, createdAt: -1 },
  { name: "idx_user_active_notifications" }
);

// Unread count query: user's unread, non-deleted notifications
notificationSchema.index(
  { userId: 1, read: 1, deletedAt: 1 },
  { name: "idx_user_unread_count" }
);

// Category filter: user's notifications filtered by category
notificationSchema.index(
  { userId: 1, category: 1, deletedAt: 1, createdAt: -1 },
  { name: "idx_user_category_filter" }
);

// ==================== PRE-SAVE HOOKS ====================

notificationSchema.pre("save", function (next) {
  if (this.isNew) {
    const config = NotificationConfig[this.type];

    // Auto-populate from config if not explicitly provided
    if (!this.category && config) {
      this.category = config.category;
    }
    if (!this.priority || this.priority === NotificationPriority.NORMAL) {
      this.priority = config?.priority || NotificationPriority.NORMAL;
    }
    if (!this.icon || this.icon === "🔔") {
      this.icon = config?.icon || "🔔";
    }
    if (!this.channels || this.channels.length === 0) {
      this.channels = config?.channels || ["in_app"];
    }

    // Auto-calculate expiry from config TTL
    if (!this.expiresAt && config?.ttlDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + config.ttlDays);
      this.expiresAt = expiry;
    } else if (!this.expiresAt) {
      // Default 30-day expiry fallback
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      this.expiresAt = expiry;
    }
  }

  next();
});

// ==================== QUERY HELPERS ====================

/**
 * Default scope - exclude soft-deleted notifications
 */
notificationSchema.pre(/^find/, function () {
  // Only apply default filter if no explicit deletedAt filter is set
  if (!this.getFilter().deletedAt) {
    this.where({ deletedAt: null });
  }
});

// ==================== STATIC METHODS ====================

/**
 * Get unread count for a specific user
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
  try {
    return await this.countDocuments({
      userId,
      read: false,
      deletedAt: null,
    });
  } catch (error) {
    logger.error("Failed to get unread notification count", {
      userId,
      error: error.message,
    });
    return 0;
  }
};

/**
 * Mark multiple notifications as read for a user
 */
notificationSchema.statics.markAllRead = async function (userId) {
  return this.updateMany(
    { userId, read: false, deletedAt: null },
    { $set: { read: true, readAt: new Date() } }
  );
};

/**
 * Soft-delete all read notifications for a user
 */
notificationSchema.statics.clearAllRead = async function (userId) {
  return this.updateMany(
    { userId, read: true, deletedAt: null },
    { $set: { deletedAt: new Date() } }
  );
};

// ==================== INSTANCE METHODS ====================

/**
 * Mark this notification as read
 */
notificationSchema.methods.markRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

/**
 * Soft-delete this notification
 */
notificationSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification, notificationSchema };
