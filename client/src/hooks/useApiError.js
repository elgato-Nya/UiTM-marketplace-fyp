import { useCallback } from "react";
import { useSnackbar } from "./useSnackbar";
import {
  parseError,
  formatErrorForSnackbar,
  mapServerErrorsToForm,
  isRecoverableError,
  requiresReauth,
  ErrorType,
} from "../utils/errorUtils";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/errorMessages";

/**
 * useApiError Hook
 *
 * PURPOSE: Provide consistent error handling across components
 *
 * FEATURES:
 * - Automatic error parsing and user-friendly messages
 * - Snackbar integration with appropriate severity/duration
 * - Form field error mapping for validation errors
 * - Support for retry functionality
 * - Authentication error detection
 *
 * USAGE:
 * const { handleError, handleSuccess, showValidationErrors } = useApiError();
 *
 * try {
 *   await someApiCall();
 *   handleSuccess('profile.updated');
 * } catch (error) {
 *   handleError(error);
 * }
 */
export const useApiError = () => {
  const snackbar = useSnackbar();

  /**
   * Handle API error with automatic parsing and snackbar display
   * @param {Error|Object} error - Error from API call
   * @param {Object} options - Configuration options
   * @returns {Object} Parsed error object
   */
  const handleError = useCallback(
    (error, options = {}) => {
      const {
        fallbackMessage = null,
        showSnackbar = true,
        setFormErrors = null,
        onAuthError = null,
        silent = false,
      } = options;

      // Parse the error
      const parsed = parseError(error);

      // Override message if fallback provided
      if (
        fallbackMessage &&
        (!parsed.message || parsed.type === ErrorType.UNKNOWN)
      ) {
        parsed.message = fallbackMessage;
      }

      // Handle authentication errors
      if (requiresReauth(error) && onAuthError) {
        onAuthError(parsed);
      }

      // Map validation errors to form fields if setFormErrors provided
      if (parsed.validationErrors && setFormErrors) {
        mapServerErrorsToForm(parsed.validationErrors, setFormErrors);
      }

      // Show snackbar unless silent mode
      if (showSnackbar && !silent) {
        const snackbarConfig = formatErrorForSnackbar(error);
        snackbar.showSnackbar({
          message: snackbarConfig.message,
          severity: snackbarConfig.severity,
          duration: snackbarConfig.duration,
        });
      }

      return parsed;
    },
    [snackbar]
  );

  /**
   * Show success message via snackbar
   * @param {string} messageKey - Dot-notation key from SUCCESS_MESSAGES (e.g., 'profile.updated')
   * @param {string} customMessage - Optional custom message override
   */
  const handleSuccess = useCallback(
    (messageKey, customMessage = null) => {
      let message = customMessage;

      // Get message from constants if key provided
      if (!message && messageKey) {
        const keys = messageKey.split(".");
        let current = SUCCESS_MESSAGES;
        for (const key of keys) {
          current = current?.[key];
        }
        message = current || messageKey;
      }

      snackbar.success(message || "Operation completed successfully!");
    },
    [snackbar]
  );

  /**
   * Show validation errors in snackbar
   * @param {Array} validationErrors - Array of validation error objects
   */
  const showValidationErrors = useCallback(
    (validationErrors) => {
      if (!validationErrors || validationErrors.length === 0) return;

      if (validationErrors.length === 1) {
        snackbar.error(validationErrors[0].message);
      } else {
        const message = `Please fix ${validationErrors.length} validation errors`;
        snackbar.error(message);
      }
    },
    [snackbar]
  );

  /**
   * Handle network error with retry option
   * @param {Error} error - Network error
   * @param {Function} retryFn - Function to call on retry
   */
  const handleNetworkError = useCallback(
    (error, retryFn = null) => {
      const parsed = parseError(error);

      if (retryFn) {
        snackbar.showSnackbar({
          message: parsed.message,
          severity: "warning",
          duration: 10000,
          action: {
            label: "Retry",
            onClick: retryFn,
          },
        });
      } else {
        snackbar.warning(parsed.message);
      }

      return parsed;
    },
    [snackbar]
  );

  /**
   * Get error message by category and key
   * @param {string} category - Error category (e.g., 'auth', 'network')
   * @param {string} key - Specific error key (e.g., 'invalidCredentials')
   * @returns {string} Error message
   */
  const getErrorMessage = useCallback((category, key = "default") => {
    return ERROR_MESSAGES[category]?.[key] || ERROR_MESSAGES.unknown.default;
  }, []);

  /**
   * Get success message by category and key
   * @param {string} category - Success category (e.g., 'auth', 'profile')
   * @param {string} key - Specific success key (e.g., 'login')
   * @returns {string} Success message
   */
  const getSuccessMessage = useCallback((category, key) => {
    return (
      SUCCESS_MESSAGES[category]?.[key] || "Operation completed successfully!"
    );
  }, []);

  /**
   * Quick error display methods
   */
  const showError = useCallback(
    (message) => {
      snackbar.error(message);
    },
    [snackbar]
  );

  const showWarning = useCallback(
    (message) => {
      snackbar.warning(message);
    },
    [snackbar]
  );

  const showInfo = useCallback(
    (message) => {
      snackbar.info(message);
    },
    [snackbar]
  );

  const showSuccess = useCallback(
    (message) => {
      snackbar.success(message);
    },
    [snackbar]
  );

  return {
    // Main handlers
    handleError,
    handleSuccess,
    handleNetworkError,
    showValidationErrors,

    // Quick display methods
    showError,
    showWarning,
    showInfo,
    showSuccess,

    // Message getters
    getErrorMessage,
    getSuccessMessage,

    // Utilities
    parseError,
    isRecoverableError,
    requiresReauth,

    // Constants
    ErrorType,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
  };
};

export default useApiError;
