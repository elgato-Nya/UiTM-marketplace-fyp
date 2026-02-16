import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUnreadCount as fetchUnreadCount,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { useSocket } from "../contexts/SocketContext";

/**
 * Custom hook for notification state management
 *
 * PURPOSE: Manage unread count via WebSocket push with HTTP fallback
 * STRATEGY:
 *   - On mount, fetch current unread count via HTTP (single request)
 *   - Listen for 'notification:new' socket events for real-time increments
 *   - Fall back to periodic polling only when socket is disconnected
 *   - Keep HTTP endpoints for mark-read, delete, and preference operations
 *
 * @param {boolean} isAuthenticated - Whether the user is currently authenticated
 * @param {Object} options - Configuration options
 * @param {number} options.fallbackInterval - Polling interval when socket is down (default 60000)
 * @returns {Object} Notification state and actions
 */
const useNotifications = (isAuthenticated = false, options = {}) => {
  const { fallbackInterval = 60000 } = options;

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fallbackRef = useRef(null);
  const isMountedRef = useRef(true);

  const { socket, isConnected } = useSocket();

  /**
   * Fetch unread count from the API (used for initial load and fallback)
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

  // Initial HTTP fetch when user authenticates
  useEffect(() => {
    isMountedRef.current = true;

    if (isAuthenticated) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, refreshUnreadCount]);

  // Listen for real-time notification events via socket
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = () => {
      if (isMountedRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, isAuthenticated]);

  // Fallback polling — only active when socket is disconnected
  useEffect(() => {
    if (!isAuthenticated) return;

    // Clear any existing fallback timer
    if (fallbackRef.current) {
      clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }

    // Only poll when socket is NOT connected
    if (!isConnected) {
      fallbackRef.current = setInterval(refreshUnreadCount, fallbackInterval);
    }

    return () => {
      if (fallbackRef.current) {
        clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
    };
  }, [isAuthenticated, isConnected, fallbackInterval, refreshUnreadCount]);

  return {
    unreadCount,
    isLoading,
    markAllRead,
    decrementUnread,
    forceRefresh,
    isSocketConnected: isConnected,
  };
};

export { useNotifications };
export default useNotifications;
