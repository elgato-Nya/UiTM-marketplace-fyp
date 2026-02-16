import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUnreadCount as fetchUnreadCount,
  markAllNotificationsAsRead,
} from "../services/notificationService";

/**
 * Custom hook for notification state management
 *
 * PURPOSE: Manage unread count polling and notification state
 * PATTERN: Follows useSnackbar.js hook pattern
 *
 * @param {boolean} isAuthenticated - Whether the user is currently authenticated
 * @param {Object} options - Configuration options
 * @param {number} options.pollingInterval - Polling interval in ms (default 30000)
 * @returns {Object} Notification state and actions
 */
const useNotifications = (isAuthenticated = false, options = {}) => {
  const { pollingInterval = 30000 } = options;

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch unread count from the API
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await fetchUnreadCount();
      if (isMountedRef.current) {
        setUnreadCount(response?.unreadCount ?? 0);
      }
    } catch (error) {
      // Silently fail - don't disrupt UX for polling failures
      console.debug("Failed to fetch unread notification count:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  /**
   * Mark all notifications as read and reset the count
   */
  const markAllRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await markAllNotificationsAsRead();
      if (isMountedRef.current) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [isAuthenticated]);

  /**
   * Manually decrement unread count (e.g., when a single notification is read)
   */
  const decrementUnread = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Force a fresh count from the API
   */
  const forceRefresh = useCallback(() => {
    return refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Start/stop polling based on authentication state
  useEffect(() => {
    isMountedRef.current = true;

    if (isAuthenticated) {
      // Fetch immediately
      refreshUnreadCount();

      // Set up polling interval
      intervalRef.current = setInterval(refreshUnreadCount, pollingInterval);
    } else {
      // Clear state when logged out
      setUnreadCount(0);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, pollingInterval, refreshUnreadCount]);

  return {
    unreadCount,
    isLoading,
    markAllRead,
    decrementUnread,
    forceRefresh,
  };
};

export { useNotifications };
export default useNotifications;
