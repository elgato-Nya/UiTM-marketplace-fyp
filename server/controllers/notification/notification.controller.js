const BaseController = require("../base.controller");
const notificationService = require("../../services/notification/notification.service");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const query = sanitizeQuery(req.query);

  const result = await notificationService.getUserNotifications(userId, query);

  baseController.logAction("get_notifications", req, {
    userId: userId.toString(),
    count: result.notifications.length,
    unreadCount: result.unreadCount,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Notifications retrieved successfully"
  );
}, "get_notifications");

const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.getUnreadCount(userId);

  return baseController.sendSuccess(
    res,
    result,
    "Unread count retrieved successfully"
  );
}, "get_unread_count");

const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await notificationService.markAsRead(
    userId,
    notificationId
  );

  baseController.logAction("mark_notification_read", req, {
    userId: userId.toString(),
    notificationId,
  });

  return baseController.sendSuccess(
    res,
    { notification },
    "Notification marked as read"
  );
}, "mark_notification_read");

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.markAllAsRead(userId);

  baseController.logAction("mark_all_notifications_read", req, {
    userId: userId.toString(),
    modifiedCount: result.modifiedCount,
  });

  return baseController.sendSuccess(
    res,
    result,
    "All notifications marked as read"
  );
}, "mark_all_notifications_read");

const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  await notificationService.deleteNotification(userId, notificationId);

  baseController.logAction("delete_notification", req, {
    userId: userId.toString(),
    notificationId,
  });

  return baseController.sendSuccess(
    res,
    null,
    "Notification deleted successfully"
  );
}, "delete_notification");

const deleteAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.deleteAllRead(userId);

  baseController.logAction("delete_all_read_notifications", req, {
    userId: userId.toString(),
    modifiedCount: result.modifiedCount,
  });

  return baseController.sendSuccess(
    res,
    result,
    "All read notifications deleted"
  );
}, "delete_all_read_notifications");

const getPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.getNotificationPreferences(userId);

  baseController.logAction("get_notification_preferences", req, {
    userId: userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Notification preferences retrieved successfully"
  );
}, "get_notification_preferences");

const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const preferences = sanitizeObject(req.body);

  const result = await notificationService.updateNotificationPreferences(
    userId,
    preferences
  );

  baseController.logAction("update_notification_preferences", req, {
    userId: userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Notification preferences updated successfully"
  );
}, "update_notification_preferences");

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getPreferences,
  updatePreferences,
};
