import { useState, useCallback } from "react";

/**
 * useSnackbar Hook
 *
 * PURPOSE: Manage snackbar notifications with enhanced features
 *
 * FEATURES:
 * - Multiple snackbar support
 * - Configurable duration per severity
 * - Hint text support for errors
 * - Retry action support
 * - Auto-dismiss with manual override
 */
export const useSnackbar = () => {
  const [snackbars, setSnackbars] = useState([]);

  const showSnackbar = useCallback(
    ({
      message,
      severity = "info",
      duration = 6000,
      action = null,
      key = null,
      hint = null,
      onRetry = null,
    }) => {
      const id = key || Date.now() + Math.random();
      const snackbar = {
        id,
        message,
        severity,
        duration,
        action,
        hint,
        onRetry,
        open: true,
      };

      setSnackbars((prev) => [...prev, snackbar]);

      // Auto-remove snackbar after duration (unless duration is null)
      if (duration !== null && duration > 0) {
        setTimeout(() => {
          hideSnackbar(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const hideSnackbar = useCallback((id) => {
    setSnackbars((prev) =>
      prev.map((snackbar) =>
        snackbar.id === id ? { ...snackbar, open: false } : snackbar
      )
    );

    // Remove from array after animation completes
    setTimeout(() => {
      setSnackbars((prev) => prev.filter((s) => s.id !== id));
    }, 300);
  }, []);

  const clearAll = useCallback(() => {
    setSnackbars((prev) =>
      prev.map((snackbar) => ({ ...snackbar, open: false }))
    );

    setTimeout(() => {
      setSnackbars([]);
    }, 300);
  }, []);

  // Convenience methods with proper accessibility
  const success = useCallback(
    (message, options = {}) => {
      return showSnackbar({
        message,
        severity: "success",
        duration: 4000,
        ...options,
      });
    },
    [showSnackbar]
  );

  const error = useCallback(
    (message, options = {}) => {
      return showSnackbar({
        message,
        severity: "error",
        duration: 8000, // Errors stay longer
        ...options,
      });
    },
    [showSnackbar]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return showSnackbar({
        message,
        severity: "warning",
        duration: 6000,
        ...options,
      });
    },
    [showSnackbar]
  );

  const info = useCallback(
    (message, options = {}) => {
      return showSnackbar({
        message,
        severity: "info",
        duration: 4000,
        ...options,
      });
    },
    [showSnackbar]
  );

  /**
   * Show error with hint and optional retry action
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  const errorWithHint = useCallback(
    (message, hint, options = {}) => {
      return showSnackbar({
        message,
        severity: "error",
        duration: 10000, // Longer for errors with hints
        hint,
        ...options,
      });
    },
    [showSnackbar]
  );

  /**
   * Show error with retry action
   * @param {string} message - Error message
   * @param {Function} onRetry - Retry callback
   * @param {Object} options - Additional options
   */
  const errorWithRetry = useCallback(
    (message, onRetry, options = {}) => {
      return showSnackbar({
        message,
        severity: "error",
        duration: 12000, // Longer to allow retry
        onRetry,
        ...options,
      });
    },
    [showSnackbar]
  );

  /**
   * Show network error with retry option
   * @param {Function} onRetry - Retry callback
   * @param {string} customMessage - Custom message override
   */
  const networkError = useCallback(
    (onRetry = null, customMessage = null) => {
      return showSnackbar({
        message:
          customMessage || "Network error. Please check your connection.",
        severity: "warning",
        duration: onRetry ? 15000 : 8000,
        hint: "Try refreshing the page or checking your internet connection.",
        onRetry,
      });
    },
    [showSnackbar]
  );

  return {
    snackbars,
    showSnackbar,
    hideSnackbar,
    clearAll,
    // Standard methods
    success,
    error,
    warning,
    info,
    // Enhanced error methods
    errorWithHint,
    errorWithRetry,
    networkError,
  };
};
