# Notification System Implementation Plan

> Complete implementation roadmap for the ecommerce platform notification system

**Created:** February 7, 2026  
**Status:** ✅ Implemented  
**Priority:** High  
**Last Updated:** February 2026

---

## 🎯 Executive Summary

Building a comprehensive notification system with:

- **In-app notifications** (primary channel) — ✅ Implemented
- **Email notifications** (critical events only) — ✅ Implemented (6 critical types)
- **Real-time delivery** (future-ready for chat feature) — ⏳ Polling now, Socket.io next
- **User preferences** (granular control) — ✅ Implemented (per-category in-app + email)
- **30-day retention** (auto-cleanup) — ✅ Implemented (TTL index + cron job)

### Key Decisions

| Decision           | Choice                        | Rationale                         |
| ------------------ | ----------------------------- | --------------------------------- |
| **Real-time Tech** | Socket.io                     | Needed for future chat feature    |
| **Implementation** | Polling → WebSocket           | Start simple, upgrade seamlessly  |
| **Email Strategy** | Critical only (6 types)       | Avoid spam, respect users         |
| **Architecture**   | Functional Programming        | Match existing codebase patterns  |
| **Code Reuse**     | DRY - leverage existing utils | Consistency & maintainability     |
| **Retention**      | 30 days                       | Balance storage vs history        |
| **Migration**      | Incremental                   | Safe, testable, rollback-friendly |

---

## 🏛️ Architecture Decisions

### Code Reuse & DRY Principles

**Backend:**

- ✅ **Functional Programming** - All services use FP (not classes)
- ✅ **Reuse `base.service.js`** - handleServiceError, handleNotFoundError, buildSort, buildSelect
- ✅ **Reuse `asyncHandler`** - Consistent error handling in controllers
- ✅ **Reuse `BaseController`** - sendSuccess, logAction methods
- ✅ **Reuse `email.service.js`** - Extend existing email functions (don't recreate)
- ✅ **Reuse error utilities** - createNotFoundError, createValidationError, createForbiddenError
- ✅ **Reuse logger** - Consistent logging across all services
- ✅ **Reuse sanitizer** - sanitizeObject, sanitizeQuery

**Frontend:**

- ✅ **Reuse `api/index.js`** - Don't create separate axios instance
- ✅ **Follow service pattern** - Same structure as merchantService.js, uploadService.js
- ✅ **Inherit interceptors** - Auth, error handling, token refresh all automatic
- ✅ **Consistent error handling** - All services handle errors the same way

### Email Policy (Anti-Spam)

**ONLY 6 notification types send emails:**

1. `NEW_ORDER_RECEIVED` (Seller) - Business critical
2. `ORDER_DELIVERED` (Buyer) - Final status
3. `QUOTE_REQUEST_RECEIVED` (Seller) - Business opportunity
4. `QUOTE_RESPONSE_RECEIVED` (Buyer) - Awaited response
5. `PASSWORD_RESET` - Security critical
6. `SECURITY_ALERT` - Security critical

**All other 20+ notification types = In-app only**

This reduces email fatigue and respects user inbox.

---

## 📊 Current State Analysis

### ✅ What We Have

- Route defined: `/notifications`
- Navigation links with placeholder badge
- Documentation in `docs/features/11-search-notifications.md`
- Quote notification enums defined
- Email service infrastructure ready (`email.service.js`)
- Existing email templates
- Base service utilities (`base.service.js`, `asyncHandler`)
- Base controller class (`base.controller.js`)
- Centralized API service (`client/src/services/api/index.js`)
- Error handling utilities (`utils/errors`)
- Logger utility (`utils/logger.js`)
- Sanitizer utility (`utils/sanitizer.js`)

### ❌ What We Need

- ~~Notification database model~~ ✅ Done
- ~~Backend API (routes, controllers, services)~~ ✅ Done
- ~~Frontend notification page~~ ✅ Done
- Real-time delivery system (Socket.io — Phase 2)
- ~~User preference management~~ ✅ Done
- ~~Event integration across features~~ ✅ Done

---

## 🏗️ Implementation Phases

## Phase 1: Backend Foundation (Week 1-2)

### 1.1 Database Models

#### Notification Schema

```javascript
// server/models/notification/notification.model.js
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  type: String (enum, indexed),
  category: String (enum: 'order', 'shopping', 'merchant', 'quote', 'system', 'admin'),
  priority: String (enum: 'low', 'normal', 'high', 'urgent'),

  // Content
  title: String (required, max: 100),
  message: String (required, max: 500),
  icon: String (emoji or icon name),

  // Related data
  data: {
    orderId: ObjectId,
    listingId: ObjectId,
    quoteId: ObjectId,
    merchantId: ObjectId,
    actionUrl: String,
    imageUrl: String,
    metadata: Object
  },

  // Status
  read: Boolean (default: false, indexed),
  readAt: Date,

  // Delivery
  channels: [String] (enum: ['in_app', 'email']),
  emailSent: Boolean (default: false),
  emailSentAt: Date,

  // Lifecycle
  createdAt: Date (indexed, TTL: 30 days),
  expiresAt: Date (indexed),
  deletedAt: Date (soft delete)
}

// Indexes
userId + createdAt (desc)
userId + read + createdAt (desc)
type + createdAt (desc)
expiresAt (TTL index)
```

#### User Schema Extension

```javascript
// Add to existing User model
notificationPreferences: {
  // Global settings
  enabled: { type: Boolean, default: true },

  // Category preferences
  order: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  shopping: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  },
  merchant: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  quote: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  system: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  admin: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  }
}
```

### 1.2 Notification Types Enum

```javascript
// server/utils/enums/notification.enum.js

const NotificationType = Object.freeze({
  // Order Notifications
  ORDER_PLACED: 'order_placed',              // In-App only
  ORDER_CONFIRMED: 'order_confirmed',        // In-App only
  ORDER_PROCESSING: 'order_processing',      // In-App only
  ORDER_SHIPPED: 'order_shipped',            // In-App only
  ORDER_DELIVERED: 'order_delivered',        // Email + In-App (CRITICAL)
  ORDER_CANCELLED: 'order_cancelled',        // In-App only
  ORDER_REFUNDED: 'order_refunded',          // In-App only

  // Shopping Notifications (In-App Only)
  PRICE_DROP: 'price_drop',
  BACK_IN_STOCK: 'back_in_stock',
  CART_REMINDER: 'cart_reminder',
  WISHLIST_AVAILABLE: 'wishlist_available',

  // Merchant Notifications
  NEW_ORDER_RECEIVED: 'new_order_received',      // Email + In-App (CRITICAL)
  LOW_STOCK_ALERT: 'low_stock_alert',             // In-App only
  LISTING_APPROVED: 'listing_approved',           // In-App only
  LISTING_REJECTED: 'listing_rejected',           // In-App only
  REVIEW_RECEIVED: 'review_received',             // In-App only
  PAYOUT_PROCESSED: 'payout_processed',           // In-App only

  // Quote Notifications
  QUOTE_REQUEST_RECEIVED: 'quote_request_received',   // Email + In-App (CRITICAL)
  QUOTE_RESPONSE_RECEIVED: 'quote_response_received', // Email + In-App (CRITICAL)
  QUOTE_ACCEPTED: 'quote_accepted',                   // In-App only
  QUOTE_REJECTED: 'quote_rejected',                   // In-App only
  QUOTE_EXPIRING_SOON: 'quote_expiring_soon',         // In-App only
  QUOTE_EXPIRED: 'quote_expired',                     // In-App only

  // System Notifications
  WELCOME: 'welcome',                           // In-App only
  EMAIL_VERIFIED: 'email_verified',             // In-App only
  PASSWORD_RESET: 'password_reset',             // Email + In-App (CRITICAL)
  PASSWORD_CHANGED: 'password_changed',         // In-App only
  MERCHANT_VERIFIED: 'merchant_verified',       // In-App only
  MERCHANT_REJECTED: 'merchant_rejected',       // In-App only
  ACCOUNT_SUSPENDED: 'account_suspended',       // In-App only
  SECURITY_ALERT: 'security_alert',             // Email + In-App (CRITICAL)

  // Admin Notifications
  PENDING_MERCHANT_VERIFICATION: 'pending_merchant_verification', // In-App only
  FLAGGED_LISTING: 'flagged_listing',                             // In-App only
  CONTACT_FORM_SUBMISSION: 'contact_form_submission',             // In-App only
  PAYMENT_DISPUTE: 'payment_dispute',                             // In-App only
  SYSTEM_ALERT: 'system_alert'                                    // In-App only
});

/**
 * EMAIL NOTIFICATION POLICY (6 CRITICAL TYPES ONLY)
 *
 * To avoid spam and respect user inbox, only these notifications send emails:
 * 1. NEW_ORDER_RECEIVED (Seller) - Critical for business
 * 2. ORDER_DELIVERED (Buyer) - Final order status
 * 3. QUOTE_REQUEST_RECEIVED (Seller) - Business opportunity
 * 4. QUOTE_RESPONSE_RECEIVED (Buyer) - Awaited response
 * 5. PASSWORD_RESET - Security critical
 * 6. SECURITY_ALERT - Security critical
 *
 * All other notifications are in-app only to reduce email fatigue.
 */

const NotificationCategory = Object.freeze({
  ORDER: 'order',
  SHOPPING: 'shopping',
  MERCHANT: 'merchant',
  // Order notifications
  [NotificationType.ORDER_PLACED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ['in_app'],
    icon: '📦',
    ttlDays: 30
  },
  [NotificationType.ORDER_DELIVERED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '✅',
    ttlDays: 30
  },
  [NotificationType.NEW_ORDER_RECEIVED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.URGENT,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '🛍️',
    ttlDays: 30
  },
  [NotificationType.QUOTE_REQUEST_RECEIVED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '💬',
    ttlDays: 30
  },
  [NotificationType.QUOTE_RESPONSE_RECEIVED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '💬',
    ttlDays: 30
  },
  [NotificationType.PASSWORD_RESET]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.URGENT,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '🔐',
    ttlDays: 7
  },
  [NotificationType.SECURITY_ALERT]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.URGENT,
    channels: ['in_app', 'email'], // CRITICAL - Email enabled
    icon: '⚠️',
    ttlDays: 30
  },
  [NotificationType.PRICE_DROP]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.NORMAL,
    channels: ['in_app'], // In-app only
    icon: '💰',
    ttlDays: 7
  },
  // ... (add remaining types with in_app only channelED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.URGENT,
    channels: ['in_app', 'email'],
    icon: '🛍️',
    ttlDays: 30
  },
  [NotificationType.PRICE_DROP]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.NORMAL,
    channels: ['in_app'],
    icon: '💰',
    ttlDays: 7
  },
  // ... (full mapping for all types)
};

module.exports = {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationConfig
};
```

### 1.3 Notification Service (Functional Programming)

````javascript
// server/services/notification/notification.service.js

const { Notification, User } = require('../../models');
const { NotificationConfig, NotificationType } = require('../../utils/enums/notification.enum');
const { sendEmail } = require('../email.service');
const { handleServiceError, handleNotFoundError } = require('../base.service');
const logger = require('../../utils/logger');
const {
  createNotFoundError,
  createValidationError,
  createForbiddenError
} = require('../../utils/errors');

/**
 * Create and deliver a notification
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.type - Notification type (from enum)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Object} params.data - Additional data (orderId, listingId, etc.)
 * @param {string} params.priority - Priority override (optional)
 * @param {Array} params.channels - Channel override (optional)
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  priority = null,
  channels = null
}) => {
  try {
    // 1. Get notification config
    const config = NotificationConfig[type];
    if (!config) {
      return createValidationError(
        `Invalid notification type: ${type}`,
        { type },
        'INVALID_NOTIFICATION_TYPE'
      );
    }

    // 2. Check if user exists and get preferences
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) {
      return handleNotFoundError('User', 'USER_NOT_FOUND', 'create_notification', { userId });
    }

    // 3. Check user preferences (if user has disabled notifications)
    const prefs = user.notificationPreferences || {};
    if (prefs.enabled === false) {
      logger.info('Notification skipped - user disabled all notifications', { userId, type });
      return null; // User disabled all notifications
    }

    // Check category-specific preferences
    const categoryPref = prefs[config.category];
    if (categoryPref && categoryPref.inApp === false) {
      logger.info('Notification skipped - user disabled category', { userId, type, category: config.category });
      return null; // User disabled this category
    }

    // 4. Determine delivery channels (respect user preferences)
    const finalChannels = channels || config.channels;
    const deliveryChannels = finalChannels.filter(channel => {
      if (channel === 'in_app') return categoryPref?.inApp !== false;
      if (channel === 'email') return categoryPref?.email !== false;
      return true;
    });

    if (deliveryChannels.length === 0) {
      logger.info('Notification skipped - no enabled channels', { userId, type });
      return null;
    }

    // 5. Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.ttlDays);

    // 6. Create notification record
    const notification = await Notification.create({
      usControllers (Following Existing Pattern)

```javascript
// server/controllers/notification/notification.controller.js

const BaseController = require('../base.controller');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../../services/notification/notification.service');
const { sanitizeObject, sanitizeQuery } = require('../../utils/sanitizer');
const asyncHandler = require('../../utils/asyncHandler');

const baseController = new BaseController();

/**
 * Get user notifications with pagination
 */
const handleGetUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit, unreadOnly, category } = sanitizeQuery(req.query);

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    unreadOnly: unreadOnly === 'true',
    category: category || null
  };

  const result = await getUserNotifications(userId, options);

  baseController.logAction('get_notifications', req, {
    userId: userId.toString(),
    page: options.page,
    total: result.pagination.total
  });

  return baseController.sendSuccess(
    res,
    result,
    'Notifications retrieved successfully'
  );
}, 'handle_get_user_notifications');

/**
 * Get unread count
 */
const handleGetUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await getUnreadCount(userId);

  return baseController.sendSuccess(
    res,
    { count },
    'Unread count retrieved successfully'
  );
}, 'handle_get_unread_count');

/**
 * Mark notification as read
 */
const handleMarkAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await markAsRead(id, userId);

  baseController.logAction('mark_notification_read', req, {
    userId: userId.toString(),
    notificationId: id
  });

  return baseController.sendSuccess(
    res,
    notification,
    'Notification marked as read'
  );
}, 'handle_mark_as_read');

/**
 * Mark all as read
 */
const handleMarkAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await markAllAsRead(userId);

  baseController.logAction('mark_all_notifications_read', req, {
    userId: userId.toString(),
    count: result.modifiedCount
  });

  return baseController.sendSuccess(
    res,
    result,
    `${result.modifiedCount} notification(s) marked as read`
  );
}, 'handle_mark_all_as_read');

/**
 * Delete notification
 */
const handleDeleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await deleteNotification(id, userId);

  baseController.logAction('delete_notification', req, {
    userId: userId.toString(),
    notificationId: id
  });

  return baseController.sendSuccess(
    res,
    notification,
    'Notification deleted successfully'
  );
}, 'handle_delete_notification');

/**
 * Delete all read notifications
 */
const handleDeleteAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await deleteAllRead(userId);

  baseController.logAction('delete_all_read_notifications', req, {
    userId: userId.toString(),
    count: result.modifiedCount
  });

  return baseController.sendSuccess(
    res,
    result,
    `${result.modifiedCount} notification(s) deleted`
  );
}, 'handle_delete_all_read');

/**
 * Get notification preferences
 */
const handleGetPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { User } = require('../../models');

  const user = await User.findById(userId).select('notificationPreferences');
  const preferences = user?.notificationPreferences || {};

  return baseController.sendSuccess(
    res,
    preferences,
    'Preferences retrieved successfully'
  );
}, 'handle_get_preferences');

/**
 * Update notification preferences
 */
const handleUpdatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const preferences = sanitizeObject(req.body);
  const { User } = require('../../models');

  const user = await User.findByIdAndUpdate(
    userId,
    { notificationPreferences: preferences },
    { new: true, select: 'notificationPreferences' }
  );

  baseController.logAction('update_notification_preferences', req, {
    userId: userId.toString()
  });

  return baseController.sendSuccess(
    res,
    user.notificationPreferences,
    'Preferences updated successfully'
  );
}, 'handle_update_preferences');

module.exports = {
  handleGetUserNotifications,
  handleGetUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDeleteNotification,
  handleDeleteAllRead,
  handleGetPreferences,
  handleUpdatePreferences
};
````

### 1.5 API Routes

```javascript
// server/routes/notification/notification.route.js

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth.middleware");
const {
  handleGetUserNotifications,
  handleGetUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDeleteNotification,
  handleDeleteAllRead,
  handleGetPreferences,
  handleUpdatePreferences,
} = require("../../controllers/notification/notification.controller");

// All routes require authentication
router.use(authenticate);

// GET routes
router.get("/", handleGetUserNotifications);
router.get("/unread-count", handleGetUnreadCount);
router.get("/preferences", handleGetPreferences);

// PATCH routes
router.patch("/:id/read", handleMarkAsRead);
router.patch("/read-all", handleMarkAllAsRead);
router.patch("/preferences", handleUpdatePreferences);

// DELETE routes
router.delete("/:id", handleDeleteNotification);
router.delete("/read", handleDeleteAllRead);

module.exports = router;
```

### 1.6 Register Routes in Main Server

```javascript
// server/index.js or server/routes/index.js

// Add notification routes
const notificationRoutes = require('./notification/notification.route');
app.use('/api/notifications', notificationRoutes)rId, deletedAt: null };

    if (unreadOnly) {
      query.read = false;
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    return handleServiceError(error, 'get_user_notifications', { userId });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      userId,
      read: false,
      deletedAt: null
    });
    return count;
  } catch (error) {
    return handleServiceError(error, 'get_unread_count', { userId });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, deletedAt: null },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return handleNotFoundError('Notification', 'NOTIFICATION_NOT_FOUND', 'mark_as_read', {
        notificationId,
        userId
      });
    }7 Email Templates (Reuse Existing Email Service)

    return notification;
  } catch (error) {
    return handleServiceError(error, 'mark_as_read', { notificationId, userId });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false, deletedAt: null },
      { read: true, readAt: new Date() }
    );

    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    return handleServiceError(error, 'mark_all_as_read', { userId });
  }
};

/**
 * Delete notification (soft delete)
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return handleNotFoundError('Notification', 'NOTIFICATION_NOT_FOUND', 'delete_notification', {
        notificationId,
        userId
      });
    }

    return notification;
  } catch (error) {
    return handleServiceError(error, 'delete_notification', { notificationId, userId });
  }
};

/**
 * Delete all read notifications (soft delete)
 */
const deleteAllRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: true, deletedAt: null },
      { deletedAt: new Date() }
    );

    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    return handleServiceError(error, 'delete_all_read', { userId });
  }
};

/**
 * Cleanup expired notifications (cron job)
 * Hard delete notifications past their expiry date
 */
const cleanupExpired = async () => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    logger.info('Expired notifications cleaned up', {
      deletedCount: result.deletedCount
    });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    logger.error('Failed to cleanup expired notifications', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  cleanupExpired
};
```

### 1.4 API Routes

```javascript
// server/routes/notification/notification.route.js

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth.middleware");
const notificationController = require("../../controllers/notification/notification.controller");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 * @query   page, limit, unreadOnly
 */
router.get("/", notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch("/:id/read", notificationController.markAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete("/:id", notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/read", notificationController.deleteAllRead);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get("/preferences", notificationController.getPreferences);

/**
 * @route   PATCH /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.patch("/preferences", notificationController.updatePreferences);

module.exports = router;
```

### 1.5 Email Templates

```javascript
// server/services/email/templates/notifications/

// order-placed.template.js
// new-order-received.template.js
// order-shipped.template.js
// quote-request.template.js
// quote-response.template.js
// merchant-verified.template.js
// etc.
```

---

## Phase 2: Frontend Implementation (Week 3-4)

### 2.1 API Service (Reuse Existing Structure)

**No new file needed!** Add notification methods to existing service pattern.

```javascript
// client/src/services/notificationService.js
// Following the same pattern as merchantService.js, uploadService.js, etc.

import api from "./api";

/**
 * Notification Service
 *
 * PURPOSE: Handle notification-related API calls
 * SCOPE: Fetch, manage, and update notifications
 * PATTERN: Follows existing service structure (reuses api from index.js)
 */

/**
 * Get user notifications
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {boolean} params.unreadOnly - Filter unread only
 * @param {string} params.category - Filter by category
 * @returns {Promise<Object>} Notifications with pagination
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get("/notifications", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Result with count
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Deleted notification
 */
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Delete all read notifications
 * @returns {Promise<Object>} Result with count
 */
export const deleteAllRead = async () => {
  try {
    const response = await api.delete("/notifications/read");
    return response.data;
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    throw error;
  }
};

/**
 * Get notification preferences
 * @returns {Promise<Object>} User preferences
 */
export const getPreferences = async () => {
  try {
    const response = await api.get("/notifications/preferences");
    return response.data;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

/**
 * Update notification preferences
 * @param {Object} preferences - Updated preferences
 * @returns {Promise<Object>} Updated preferences
 */
export const updatePreferences = async (preferences) => {
  try {
    const response = await api.patch("/notifications/preferences", preferences);
    return response.data;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};
```

**Benefits of this approach:**

- ✅ Reuses existing `api` instance from `client/src/services/api/index.js`
- ✅ Inherits all interceptors (auth, error handling, refresh token logic)
- ✅ Follows exact same pattern as `merchantService.js`, `uploadService.js`, etc.
- ✅ DRY principle - no code duplication
- ✅ Consistent error handling across all services

### 2.2 Notification Context

```javascript
// client/src/contexts/NotificationContext.js

/**
 * Notification Context
 *
 * Manages notification state across the app
 * - Fetches notifications
 * - Polls for new notifications (30 second interval)
 * - Manages unread count
 * - Provides notification actions
 */

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Polling interval (30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Context value with all notification operations
  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
```

### 2.3 Components

#### NotificationBell (Header)

```javascript
// client/src/components/layout/Header/NotificationBell.js

/**
 * Notification Bell Icon with Badge
 * - Shows unread count
 * - Opens dropdown on click
 * - Shows recent 5 notifications
 * - Link to full notifications page
 */
```

#### NotificationDropdown

```javascript
// client/src/components/notifications/NotificationDropdown.js

/**
 * Quick notification preview dropdown
 * - Recent 5 notifications
 * - Mark as read on click
 * - "View All" link
 * - Empty state
 */
```

#### NotificationItem

```javascript
// client/src/components/notifications/NotificationItem.js

/**
 * Single notification display
 * - Icon based on type
 * - Title and message
 * - Time ago
 * - Read/unread indicator
 * - Action button (View Order, View Listing, etc.)
 * - Delete button
 */
```

#### NotificationList

```javascript
// client/src/components/notifications/NotificationList.js

/**
 * Full notification list with:
 * - Infinite scroll / pagination
 * - Filter by category
 * - Filter by read/unread
 * - Bulk actions (Mark all read, Delete all read)
 * - Empty states
 * - Loading states
 */
```

#### NotificationPreferences

```javascript
// client/src/components/notifications/NotificationPreferences.js

/**
 * Notification settings component
 * - Category toggles (Order, Shopping, Merchant, Quote, System)
 * - Channel selection per category (In-App, Email)
 * - Global enable/disable
 * - Save button
 */
```

### 2.4 Pages

```javascript
// client/src/pages/Notifications/NotificationsPage.js

/**
 * Full notifications page
 * - Header with "Mark all as read" action
 * - Filter tabs (All, Unread, Order, Shopping, etc.)
 * - NotificationList component
 * - Pagination
 * - Empty states
 * - Loading states
 */
```

### 2.5 Routing

```javascript
// Add to client/src/App.js

<Route
  path={ROUTES.NOTIFICATIONS}
  element={
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  }
/>
```

---

## Phase 2.5: Real-time Infrastructure (Week 5)

### Socket.io Setup

#### Server Setup

```javascript
// server/index.js

const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Socket authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  // Attach user to socket
  next();
});

// Socket handlers
io.on("connection", (socket) => {
  const userId = socket.user._id;

  // Join user's room
  socket.join(`user_${userId}`);

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
  });
});

// Make io available to services
app.set("io", io);
```

#### Notification Service Integration

```javascript
// Update notification.service.js

async create({ ... }) {
  // ... create notification

  // Emit real-time event if user is connected
  const io = app.get('io');
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }

  return notification;
}
```

#### Client Setup

```javascript
// client/src/services/socket.service.js

import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("new_notification", (notification) => {
      // Update notification context
      // Show toast
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
```

---

## Phase 3: Event Integration (Week 6-10)

### Integration Schedule

#### Week 6: Order Notifications

```javascript
// Integrate in order.service.js

// When order is placed
await notificationService.create({
  userId: sellerId,
  type: NotificationType.NEW_ORDER_RECEIVED,
  title: "New Order Received!",
  message: `Order #${order.orderNumber} from ${buyer.username}`,
  data: {
    orderId: order._id,
    orderNumber: order.orderNumber,
    actionUrl: `/merchant/orders/${order._id}`,
    amount: order.total,
  },
});

await notificationService.create({
  userId: buyerId,
  type: NotificationType.ORDER_PLACED,
  title: "Order Placed Successfully",
  message: `Your order #${order.orderNumber} has been confirmed`,
  data: {
    orderId: order._id,
    orderNumber: order.orderNumber,
    actionUrl: `/orders/${order._id}`,
  },
});

// Similar for: ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
```

#### Week 7: Quote Notifications

```javascript
// Integrate in quote.service.js

// When quote request is created
await notificationService.create({
  userId: sellerId,
  type: NotificationType.QUOTE_REQUEST_RECEIVED,
  // ...
});

// When quote is responded
await notificationService.create({
  userId: buyerId,
  type: NotificationType.QUOTE_RESPONSE_RECEIVED,
  // ...
});
```

#### Week 8: Shopping Notifications

```javascript
// Integrate in listing.service.js

// Price drop detection (cron job)
// When listing price changes
const affectedUsers = await Wishlist.find({ listingId });
for (const user of affectedUsers) {
  await notificationService.create({
    userId: user.userId,
    type: NotificationType.PRICE_DROP,
    title: "Price Drop Alert! 💰",
    message: `"${listing.title}" is now RM ${listing.price}`,
    data: {
      listingId: listing._id,
      oldPrice: listing.previousPrice,
      newPrice: listing.price,
      actionUrl: `/listings/${listing._id}`,
    },
  });
}

// Back in stock
// When stock changes from 0 to > 0
```

#### Week 9: Merchant Notifications

```javascript
// Low stock alert (cron job or on purchase)
if (listing.stock <= listing.lowStockThreshold) {
  await notificationService.create({
    userId: listing.merchantId,
    type: NotificationType.LOW_STOCK_ALERT,
    // ...
  });
}

// Review received
// Payout processed
// Listing approved/rejected
```

#### Week 10: System Notifications

```javascript
// Welcome notification (on registration)
// Email verification
// Merchant verification status
// Account suspension
```

---

## 🧪 Testing Strategy

### Unit Tests

- Notification service methods
- Preference checking logic
- TTL calculation
- Channel determination

### Integration Tests

- API endpoints
- Database operations
- Email sending
- WebSocket events

### E2E Tests

- User receives notification
- Mark as read flow
- Delete notification flow
- Preference changes
- Real-time delivery

### Performance Tests

- 1000+ notifications pagination
- Concurrent notification creation
- WebSocket connection limits
- Database query performance

---

## 📈 Monitoring & Analytics

### Metrics to Track

- Notification delivery rate
- Email open rate
- In-app click rate
- Average time to read
- Preference change frequency
- Failed email deliveries
- WebSocket connection stability

### Logging

```javascript
logger.info("Notification created", {
  userId,
  type,
  channels,
  emailSent,
  socketDelivered,
});

logger.error("Notification delivery failed", {
  userId,
  type,
  error: error.message,
});
```

---

## 🔒 Security Considerations

1. **Authorization**: Users can only access their own notifications
2. **Validation**: Sanitize all notification content
3. **Rate Limiting**: Prevent notification spam
4. **WebSocket Auth**: Verify JWT on socket connection
5. **Email Security**: Prevent email injection
6. **Data Privacy**: Don't expose sensitive data in notifications

---

## 🚀 Deployment Checklist

### Phase 1 Deployment

- [ ] Database migrations (notification schema)
- [ ] User schema update (preferences)
- [ ] Environment variables (email config)
- [ ] Notification enums deployed
- [ ] API routes registered
- [ ] Cron job for cleanup scheduled

### Phase 2 Deployment

- [ ] Frontend components built
- [ ] API integration tested
- [ ] Polling interval configured
- [ ] Error boundaries in place
- [ ] Loading states verified

### Phase 2.5 Deployment

- [ ] Socket.io server configured
- [ ] CORS settings updated
- [ ] Client socket library installed
- [ ] Fallback to polling if socket fails
- [ ] Connection monitoring

### Phase 3 Deployment

- [ ] Event triggers tested
- [ ] Email templates verified
- [ ] Notification preferences tested
- [ ] Performance benchmarked
- [ ] Production monitoring enabled

---

## 📚 Documentation Requirements

1. **API Documentation**: OpenAPI/Swagger specs for all endpoints
2. **User Guide**: How to manage notification preferences
3. **Developer Guide**: How to trigger notifications from new features
4. **Troubleshooting**: Common issues and solutions

---

## 🔄 Future Enhancements

### Post-Launch Features

- [ ] Notification grouping (e.g., "3 new orders")
- [ ] Rich notifications (images, actions)
- [ ] Notification categories filtering
- [ ] Export notification history
- [ ] Notification templates for admins
- [ ] A/B testing for notification content
- [ ] Push notifications (mobile)
- [ ] SMS notifications (critical only)
- [ ] Notification scheduling
- [ ] Digest emails (daily/weekly summary)

### Chat Integration (Future)

- [ ] Reuse WebSocket infrastructure
- [ ] Chat notifications in same system
- [ ] Unified notification center
- [ ] Message preview in notifications

---

## 📝 Implementation Timeline

| Phase                  | Duration     | Deliverable                                 |
| ---------------------- | ------------ | ------------------------------------------- |
| **Phase 1**            | 2 weeks      | Backend complete, APIs ready                |
| **Phase 2**            | 2 weeks      | Frontend complete, polling active           |
| **Phase 2.5**          | 1 week       | Real-time working, WebSocket ready for chat |
| **Phase 3 - Orders**   | 1 week       | Order notifications live                    |
| **Phase 3 - Quotes**   | 1 week       | Quote notifications live                    |
| **Phase 3 - Shopping** | 1 week       | Shopping notifications live                 |
| **Phase 3 - Merchant** | 1 week       | Merchant notifications live                 |
| **Phase 3 - System**   | 1 week       | System notifications live                   |
| **Total**              | **10 weeks** | Full system operational                     |

---

## 🎯 Success Metrics

### Technical KPIs

- ✅ 99% notification delivery rate
- ✅ < 1 second notification creation time
- ✅ < 100ms WebSocket latency
- ✅ Zero data loss
- ✅ 30-day retention working

### User Experience KPIs

- ✅ 80%+ users enable notifications
- ✅ 50%+ notification click-through rate
- ✅ < 5% email unsubscribe rate
- ✅ 90%+ user satisfaction with notification relevance

---

## 🤝 Team Coordination

### Developer Responsibilities

- **Backend**: Models, services, APIs, email templates
- **Frontend**: Components, pages, context, socket integration
- **Full-stack**: WebSocket setup, event integration

### Review Points

- Schema design review (before implementation)
- API contract review (before frontend starts)
- UI/UX review (notification components)
- Security review (before Phase 1 deployment)
- Performance review (before Phase 3)
- Final QA (before production)

---

## 📞 Support & Maintenance

### Ongoing Tasks

- Monitor notification delivery rates
- Review user feedback on notification relevance
- Optimize database queries as data grows
- Update email templates based on engagement
- Clean up old notifications (automated)
- Review and update notification preferences

### Escalation Path

1. **User complaints**: Check preferences → Check delivery logs → Check email service
2. **Performance issues**: Check database indexes → Check query performance → Optimize
3. **WebSocket issues**: Check connection logs → Fallback to polling → Investigate

---

## 🏁 Conclusion

This notification system is designed to be:

- **Scalable**: Handle thousands of users
- **Extensible**: Easy to add new notification types
- **Future-ready**: WebSocket infrastructure for chat
- **User-friendly**: Granular control, not spammy
- **Maintainable**: Clean architecture, well-documented

---

## ✅ Implementation Summary

### Backend Files Created/Modified

| File | Status | Description |
|------|--------|-------------|
| `server/utils/enums/notification.enum.js` | ✅ Created | 26 notification types, 6 categories, priority levels, config map |
| `server/models/notification/notification.model.js` | ✅ Created | Mongoose schema with TTL, indexes, soft delete |
| `server/models/index.js` | ✅ Modified | Added Notification model export |
| `server/models/user/user.model.js` | ✅ Modified | Added `notificationPreferences` subdocument |
| `server/services/notification/notification.service.js` | ✅ Created | CRUD, bulk, preferences, email integration |
| `server/controllers/notification/notification.controller.js` | ✅ Created | 8 endpoints with BaseController pattern |
| `server/validators/notification.validator.js` | ✅ Created | Request validation middleware |
| `server/routes/notification.routes.js` | ✅ Created | Protected routes with validation |
| `server/index.js` | ✅ Modified | Mounted `/api/notifications` routes |
| `server/jobs/notification-cleanup.job.js` | ✅ Created | Cron job for 30-day TTL cleanup |
| `server/services/email.service.js` | ✅ Modified | Added `sendNotificationEmail`, merchant email functions |

### Notification Triggers Wired

| Service/Controller | Events | Recipients |
|-------------------|--------|------------|
| `order.service.js` | createOrder, cancelOrder | Seller + Buyer |
| `order.helpers.js` | shipped, delivered, completed | Buyer / Seller |
| `quote.service.js` | create, provide, accept, reject, cancel, start, complete | Buyer ↔ Seller |
| `auth.service.js` | createUser, verifyEmail, resetPassword | User |
| `merchant.controller.js` | verify, reject, suspend, reactivate | Merchant |
| `payout.service.js` | requestPayout, verifyBankDetails, processPayout | Seller |
| `contact.service.js` | createContactSubmission | All Admins |

### Email Integration

| Type | Recipient | Trigger |
|------|-----------|---------|
| `NEW_ORDER_RECEIVED` | Seller | New order created |
| `ORDER_DELIVERED` | Buyer | Order delivered |
| `QUOTE_REQUEST_RECEIVED` | Seller | New quote request |
| `QUOTE_RESPONSE_RECEIVED` | Buyer | Seller provides quote |
| `PASSWORD_RESET` | User | Password reset requested (existing) |
| `SECURITY_ALERT` | User | Security events |

### Frontend Files Created/Modified

| File | Status | Description |
|------|--------|-------------|
| `client/src/services/notificationService.js` | ✅ Created | 8 API functions including preferences |
| `client/src/hooks/useNotification.js` | ✅ Created | Polling hook with 30s interval |
| `client/src/contexts/NotificationContext.js` | ✅ Created | Context provider for global state |
| `client/src/components/notification/NotificationItem.js` | ✅ Created | Reusable notification row component |
| `client/src/components/notification/NotificationDropdown.js` | ✅ Created | Header bell icon dropdown |
| `client/src/pages/Notifications/NotificationsPage.js` | ✅ Created | Full notification center with filters |
| `client/src/pages/Notifications/NotificationPreferencesPage.js` | ✅ Created | Category-level preference management |
| `client/src/App.js` | ✅ Modified | Added routes for preferences page |

### Remaining (Phase 2)

- [ ] Socket.io real-time delivery (replace polling)
- [ ] Push notifications (PWA/service worker)
- [ ] Notification sound preferences
- [ ] Admin notification dashboard

---

**Document Version:** 2.0  
**Last Updated:** February 2026  
**Status:** ✅ Phase 1 Complete — Phase 2 (Real-time) Pending
