/**
 * Utility functions for handling and formatting error messages
 */

/**
 * Format error message based on error type and details
 * @param {Object} error - Error object from Redux state
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return "An unknown error occurred.";

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle network errors
  if (error.type === "network" || error.statusCode === 0 || !error.statusCode) {
    return "Network Error: Unable to connect to server. Please check your internet connection and try again.";
  }

  // Handle validation errors
  if (error.type === "validation" || error.validationErrors) {
    let baseMessage = "Validation Error: ";

    if (error.validationErrors && Array.isArray(error.validationErrors)) {
      const validationMessages = error.validationErrors.map((err) =>
        typeof err === "string"
          ? err
          : err.message || err.msg || "Invalid input"
      );
      return baseMessage + validationMessages.join(", ");
    } else if (
      error.validationErrors &&
      typeof error.validationErrors === "object"
    ) {
      const validationMessages = Object.values(error.validationErrors)
        .flat()
        .map((err) =>
          typeof err === "string"
            ? err
            : err.message || err.msg || "Invalid input"
        );
      return baseMessage + validationMessages.join(", ");
    }
    return baseMessage + "Please check your input and try again.";
  }

  // Handle server errors by status code
  switch (error.statusCode) {
    case 400:
      return error.message || "Bad Request: The request was invalid.";
    case 401:
      return "Authentication Error: Please log in again.";
    case 403:
      return "Permission Error: You don't have permission to perform this action.";
    case 404:
      return "Not Found: The requested resource could not be found.";
    case 409:
      return (
        error.message ||
        "Conflict: This operation conflicts with existing data."
      );
    case 422:
      return error.message || "Validation Error: Please check your input.";
    case 429:
      return "Rate Limit: Too many requests. Please wait a moment and try again.";
    case 500:
      return "Server Error: Something went wrong on our end. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "Service Unavailable: The server is temporarily unavailable. Please try again later.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
};

/**
 * Format success message based on operation type
 * @param {string|Object} success - Success message or object
 * @param {string} operation - Type of operation (create, update, delete, etc.)
 * @returns {string} - Formatted success message
 */
export const formatSuccessMessage = (success, operation = "operation") => {
  if (!success) return `${operation} completed successfully.`;

  if (typeof success === "string") {
    return success;
  }

  if (success.message) {
    return success.message;
  }

  // Default success messages by operation type
  const defaultMessages = {
    create: "Address created successfully!",
    update: "Address updated successfully!",
    delete: "Address deleted successfully!",
    setDefault: "Default address updated successfully!",
    fetch: "Addresses loaded successfully!",
  };

  return defaultMessages[operation] || `${operation} completed successfully!`;
};

/**
 * Check if error is a network error
 * @param {Object} error - Error object
 * @returns {boolean} - True if network error
 */
export const isNetworkError = (error) => {
  return !error.response || error.statusCode === 0 || error.type === "network";
};

/**
 * Check if error is a validation error
 * @param {Object} error - Error object
 * @returns {boolean} - True if validation error
 */
export const isValidationError = (error) => {
  return (
    error.type === "validation" ||
    error.statusCode === 400 ||
    error.statusCode === 422 ||
    error.validationErrors
  );
};

/**
 * Get error severity for alert display
 * @param {Object} error - Error object
 * @returns {string} - MUI Alert severity level
 */
export const getErrorSeverity = (error) => {
  if (isNetworkError(error)) return "warning";
  if (isValidationError(error)) return "error";
  if (error.statusCode >= 500) return "error";
  return "error";
};
