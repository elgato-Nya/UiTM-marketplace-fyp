import api from "./api";

/**
 * Notification Service
 *
 * PURPOSE: Handle notification-related API calls
 * SCOPE: Notification CRUD, read state, preferences, unread count polling
 */

/**
 * Get paginated notifications for the current user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.limit - Items per page (default 20, max 50)
 * @param {string} params.category - Filter by category (order, shopping, merchant, quote, system, admin)
 * @param {string} params.read - Filter by read state ("true" or "false")
 * @param {string} params.sort - Sort fields (e.g., "-createdAt")
 * @returns {Promise<Object>} { notifications, unreadCount, pagination }
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
 * Get unread notification count (lightweight endpoint for polling)
 * @returns {Promise<Object>} { unreadCount }
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} { modifiedCount }
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete a single notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success response
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Delete all read notifications
 * @returns {Promise<Object>} { modifiedCount }
 */
export const deleteAllReadNotifications = async () => {
  try {
    const response = await api.delete("/notifications/read");
    return response.data;
  } catch (error) {
    console.error("Error deleting all read notifications:", error);
    throw error;
  }
};

/**
 * Get notification preferences for the current user
 * @returns {Promise<Object>} { preferences }
 */
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get("/notifications/preferences");
    return response.data;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
};

/**
 * Update notification preferences
 * @param {Object} preferences - Updated preference fields
 * @returns {Promise<Object>} { preferences }
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put("/notifications/preferences", preferences);
    return response.data;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
};
