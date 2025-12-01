import { useState, useCallback } from "react";

export const useSnackbar = () => {
  const [snackbars, setSnackbars] = useState([]);

  const showSnackbar = useCallback(
    ({
      message,
      severity = "info",
      duration = 6000,
      action = null,
      key = null,
    }) => {
      const id = key || Date.now() + Math.random();
      const snackbar = {
        id,
        message,
        severity,
        duration,
        action,
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

  return {
    snackbars,
    showSnackbar,
    hideSnackbar,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};
