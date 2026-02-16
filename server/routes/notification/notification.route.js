const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getPreferences,
  updatePreferences,
} = require("../../controllers/notification");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  validateGetNotifications,
  validateNotificationId,
} = require("../../middleware/validations/notification/notification.validation");
const { standardLimiter } = require("../../middleware/limiters.middleware");

/**
 * Notification Routes
 *
 * PURPOSE: Handle notification operations for authenticated users
 * SCOPE: Notification CRUD, read state management, user preferences
 * AUTHENTICATION: All routes require authentication
 * AUTHORIZATION: Users can only access their own notifications
 * RATE LIMITING: standardLimiter (100 requests per 15 minutes)
 *
 * ROUTE STRUCTURE:
 * - GET    /api/notifications           → Paginated notification list
 * - GET    /api/notifications/unread     → Unread count (for polling)
 * - PATCH  /api/notifications/read-all  → Mark all as read
 * - DELETE /api/notifications/read      → Delete all read notifications
 * - PATCH  /api/notifications/:notificationId/read → Mark single as read
 * - DELETE /api/notifications/:notificationId      → Delete single notification
 * - GET    /api/notifications/preferences           → Get preferences
 * - PUT    /api/notifications/preferences           → Update preferences
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and rate limiting middleware to all routes
router.use(protect);
router.use(standardLimiter);

/**
 * @route   GET /api/notifications
 * @desc    Get paginated notifications for the authenticated user
 * @access  Private
 * @query   { page, limit, category, read, sort }
 * @returns { notifications, unreadCount, pagination }
 */
router.get("/", validateGetNotifications, getNotifications);

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notification count (lightweight endpoint for polling)
 * @access  Private
 * @returns { unreadCount }
 */
router.get("/unread", getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all unread notifications as read
 * @access  Private
 * @returns { modifiedCount }
 */
router.patch("/read-all", markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete (soft) all read notifications
 * @access  Private
 * @returns { modifiedCount }
 */
router.delete("/read", deleteAllRead);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 * @returns { preferences }
 */
router.get("/preferences", getPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update user's notification preferences
 * @access  Private
 * @body    { enabled, order, shopping, merchant, quote, system, admin }
 * @returns { preferences }
 */
router.put("/preferences", updatePreferences);

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark a single notification as read
 * @access  Private
 * @params  notificationId - Notification ID
 * @returns { notification }
 */
router.patch("/:notificationId/read", validateNotificationId, markAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Soft-delete a single notification
 * @access  Private
 * @params  notificationId - Notification ID
 * @returns Success message
 */
router.delete(
  "/:notificationId",
  validateNotificationId,
  deleteNotification
);

module.exports = router;
