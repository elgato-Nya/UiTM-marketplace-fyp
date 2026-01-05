/**
 * Error Utilities
 *
 * PURPOSE: Centralized error handling and formatting utilities
 * USAGE: Import and use across components, thunks, and services
 *
 * FEATURES:
 * - Parse various error formats (Axios, server, network)
 * - Convert technical errors to user-friendly messages
 * - Extract validation errors with field mapping
 * - Provide actionable hints for common errors
 * - Support severity classification for UI feedback
 */

import { ERROR_MESSAGES, ERROR_HINTS } from "../constants/errorMessages";

/**
 * Error Types Enum
 */
export const ErrorType = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  NOT_FOUND: "not_found",
  RATE_LIMIT: "rate_limit",
  SERVER: "server",
  EMAIL_SERVICE: "email_service",
  PAYMENT: "payment",
  UNKNOWN: "unknown",
};

/**
 * Parse error from various sources into a standardized format
 * @param {Error|Object|string} error - Error from any source
 * @returns {Object} Standardized error object
 */
export const parseError = (error) => {
  // Handle null/undefined
  if (!error) {
    return {
      message: ERROR_MESSAGES.unknown.default,
      type: ErrorType.UNKNOWN,
      statusCode: 0,
      code: null,
      validationErrors: null,
      hint: null,
      details: null,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      type: ErrorType.UNKNOWN,
      statusCode: 0,
      code: null,
      validationErrors: null,
      hint: null,
      details: null,
      originalError: error,
    };
  }

  // Extract from Axios error response OR RTK Query error
  // RTK Query: error.data, error.status
  // Axios: error.response.data, error.response.status
  const response = error.response;
  const responseData = response?.data || error.data;

  // Handle development vs production server error formats
  const serverError = responseData?.error;
  const statusCode = response?.status || error.status || error.statusCode || 0;

  // Determine error type
  const errorType = determineErrorType(error, statusCode, responseData);

  // Extract validation errors if present
  const validationErrors = extractValidationErrors(responseData);

  // Get error message
  const message = extractErrorMessage(error, errorType, responseData);

  // Get error code
  const code = serverError?.code || responseData?.code || error.code || null;

  // Get hint if available
  const hint =
    responseData?.hint ||
    serverError?.hint ||
    getDefaultHint(errorType, code) ||
    null;

  return {
    message,
    type: errorType,
    statusCode,
    code,
    validationErrors,
    hint,
    details: responseData,
    originalError: error,
  };
};

/**
 * Determine the type of error based on various indicators
 */
const determineErrorType = (error, statusCode, responseData) => {
  // Network errors (no response)
  if (
    !error.response &&
    (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
  ) {
    return ErrorType.NETWORK;
  }

  // Check for network-related error messages
  const errorMessage = error.message?.toLowerCase() || "";
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("econnreset") ||
    errorMessage.includes("etimedout") ||
    errorMessage.includes("enotfound") ||
    errorMessage.includes("econnrefused")
  ) {
    return ErrorType.NETWORK;
  }

  // Based on status code
  switch (statusCode) {
    case 400:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 422:
      return ErrorType.VALIDATION;
    case 429:
      return ErrorType.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER;
  }

  // Check error codes
  const code = responseData?.code || responseData?.error?.code;
  if (code) {
    if (
      code.includes("EMAIL") ||
      code.includes("SMTP") ||
      code.includes("MAIL")
    ) {
      return ErrorType.EMAIL_SERVICE;
    }
    if (code.includes("PAYMENT") || code.includes("STRIPE")) {
      return ErrorType.PAYMENT;
    }
    if (code.includes("VALIDATION")) {
      return ErrorType.VALIDATION;
    }
    if (code.includes("AUTH") || code.includes("TOKEN")) {
      return ErrorType.AUTHENTICATION;
    }
  }

  return ErrorType.UNKNOWN;
};

/**
 * Extract validation errors from response data
 */
const extractValidationErrors = (responseData) => {
  if (!responseData) return null;

  // Check for formattedErrors array (our server format)
  if (
    Array.isArray(responseData.formattedErrors) &&
    responseData.formattedErrors.length > 0
  ) {
    return responseData.formattedErrors.map((err) => ({
      field: err.field || err.path || err.param || "unknown",
      message: err.message || err.msg || "Invalid value",
      value: err.value,
      location: err.location,
    }));
  }

  // Check for errors array (express-validator format)
  if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    return responseData.errors.map((err) => ({
      field: err.field || err.path || err.param || "unknown",
      message: err.message || err.msg || "Invalid value",
      value: err.value,
      location: err.location,
    }));
  }

  // Check for error.details (some server responses)
  if (
    responseData.error?.details &&
    Array.isArray(responseData.error.details)
  ) {
    return responseData.error.details;
  }

  // Check for nested validation errors object
  if (
    responseData.validationErrors &&
    typeof responseData.validationErrors === "object"
  ) {
    const errors = [];
    Object.entries(responseData.validationErrors).forEach(
      ([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            errors.push({
              field,
              message:
                typeof msg === "string" ? msg : msg.message || "Invalid value",
            });
          });
        } else if (typeof messages === "string") {
          errors.push({ field, message: messages });
        }
      }
    );
    return errors.length > 0 ? errors : null;
  }

  return null;
};

/**
 * Extract user-friendly error message
 */
const extractErrorMessage = (error, errorType, responseData) => {
  // First, try to get server message from various formats
  // RTK Query: error.data.message
  // Axios: error.response.data.message
  const serverMessage =
    responseData?.error?.message ||
    responseData?.message ||
    error.response?.data?.message ||
    error.data?.message;

  // If server provided a message, use it (but parse technical errors)
  if (serverMessage) {
    return parseToUserFriendlyMessage(serverMessage, errorType);
  }

  // Use error.message if available
  if (error.message) {
    return parseToUserFriendlyMessage(error.message, errorType);
  }

  // Fall back to default messages by type
  return getDefaultMessageByType(errorType);
};

/**
 * Parse technical error messages into user-friendly text
 */
export const parseToUserFriendlyMessage = (message, errorType = null) => {
  if (!message || typeof message !== "string") {
    return ERROR_MESSAGES.unknown.default;
  }

  const lowerMessage = message.toLowerCase();

  // Network-related technical errors
  if (
    lowerMessage.includes("econnreset") ||
    lowerMessage.includes("read econnreset")
  ) {
    return ERROR_MESSAGES.network.connectionInterrupted;
  }
  if (
    lowerMessage.includes("etimedout") ||
    lowerMessage.includes("timed out")
  ) {
    return ERROR_MESSAGES.network.timeout;
  }
  if (lowerMessage.includes("enotfound")) {
    return ERROR_MESSAGES.network.serverUnreachable;
  }
  if (
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("connection refused")
  ) {
    return ERROR_MESSAGES.network.connectionRefused;
  }
  if (
    lowerMessage.includes("network error") ||
    lowerMessage.includes("err_network")
  ) {
    return ERROR_MESSAGES.network.noConnection;
  }

  // Email service errors
  if (
    lowerMessage.includes("smtp") ||
    (lowerMessage.includes("email") && lowerMessage.includes("failed"))
  ) {
    return ERROR_MESSAGES.email.sendFailed;
  }
  if (
    lowerMessage.includes("invalid recipient") ||
    lowerMessage.includes("recipient rejected")
  ) {
    return ERROR_MESSAGES.email.invalidRecipient;
  }

  // Authentication errors
  if (lowerMessage.includes("invalid token") || lowerMessage.includes("jwt")) {
    return ERROR_MESSAGES.auth.invalidToken;
  }
  if (
    lowerMessage.includes("token expired") ||
    lowerMessage.includes("session expired")
  ) {
    return ERROR_MESSAGES.auth.sessionExpired;
  }

  // Rate limiting
  if (
    lowerMessage.includes("too many") ||
    lowerMessage.includes("rate limit")
  ) {
    return ERROR_MESSAGES.rateLimit.default;
  }

  // If message doesn't contain technical jargon, return as is
  return message;
};

/**
 * Get default message based on error type
 */
const getDefaultMessageByType = (errorType) => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return ERROR_MESSAGES.network.noConnection;
    case ErrorType.VALIDATION:
      return ERROR_MESSAGES.validation.default;
    case ErrorType.AUTHENTICATION:
      return ERROR_MESSAGES.auth.default;
    case ErrorType.AUTHORIZATION:
      return ERROR_MESSAGES.auth.noPermission;
    case ErrorType.NOT_FOUND:
      return ERROR_MESSAGES.notFound.default;
    case ErrorType.RATE_LIMIT:
      return ERROR_MESSAGES.rateLimit.default;
    case ErrorType.SERVER:
      return ERROR_MESSAGES.server.default;
    case ErrorType.EMAIL_SERVICE:
      return ERROR_MESSAGES.email.sendFailed;
    case ErrorType.PAYMENT:
      return ERROR_MESSAGES.payment.default;
    default:
      return ERROR_MESSAGES.unknown.default;
  }
};

/**
 * Get default hint for error type/code
 */
const getDefaultHint = (errorType, code) => {
  // Check code-specific hints first
  if (code && ERROR_HINTS[code]) {
    return ERROR_HINTS[code];
  }

  // Type-based hints
  switch (errorType) {
    case ErrorType.NETWORK:
      return ERROR_HINTS.network;
    case ErrorType.AUTHENTICATION:
      return ERROR_HINTS.authentication;
    case ErrorType.RATE_LIMIT:
      return ERROR_HINTS.rateLimit;
    case ErrorType.SERVER:
      return ERROR_HINTS.server;
    default:
      return null;
  }
};

/**
 * Format validation errors for display
 * @param {Array} validationErrors - Array of validation error objects
 * @returns {string} Formatted string of errors
 */
export const formatValidationErrors = (validationErrors) => {
  if (
    !validationErrors ||
    !Array.isArray(validationErrors) ||
    validationErrors.length === 0
  ) {
    return "";
  }

  if (validationErrors.length === 1) {
    return validationErrors[0].message;
  }

  return validationErrors
    .map((err) => `• ${err.field}: ${err.message}`)
    .join("\n");
};

/**
 * Format error for snackbar display
 * @param {Error|Object|string} error - Error from any source
 * @returns {Object} { message: string, severity: string, duration: number }
 */
export const formatErrorForSnackbar = (error) => {
  const parsed = parseError(error);

  let message = parsed.message;
  const severity = getErrorSeverity(parsed.type);
  let duration = 8000; // Default for errors

  // For validation errors, include summary
  if (parsed.validationErrors && parsed.validationErrors.length > 0) {
    if (parsed.validationErrors.length === 1) {
      message = parsed.validationErrors[0].message;
    } else {
      message = `${parsed.message} (${parsed.validationErrors.length} issues found)`;
    }
    duration = 10000; // Longer for validation errors
  }

  // Network errors get shorter duration with retry hint
  if (parsed.type === ErrorType.NETWORK) {
    duration = 6000;
  }

  // Rate limit errors get longer duration
  if (parsed.type === ErrorType.RATE_LIMIT) {
    duration = 12000;
  }

  return {
    message,
    severity,
    duration,
    hint: parsed.hint,
    type: parsed.type,
    validationErrors: parsed.validationErrors,
  };
};

/**
 * Get MUI severity level for error type
 */
export const getErrorSeverity = (errorType) => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "warning";
    case ErrorType.VALIDATION:
      return "error";
    case ErrorType.RATE_LIMIT:
      return "warning";
    case ErrorType.SERVER:
      return "error";
    default:
      return "error";
  }
};

/**
 * Check if error is recoverable (user can retry)
 */
export const isRecoverableError = (error) => {
  const parsed = parseError(error);

  return [ErrorType.NETWORK, ErrorType.RATE_LIMIT, ErrorType.SERVER].includes(
    parsed.type
  );
};

/**
 * Check if error requires re-authentication
 */
export const requiresReauth = (error) => {
  const parsed = parseError(error);

  if (parsed.type === ErrorType.AUTHENTICATION) {
    return true;
  }

  // Check for specific codes that require reauth
  const reauthCodes = ["INVALID_TOKEN", "TOKEN_EXPIRED", "SESSION_EXPIRED"];
  return reauthCodes.includes(parsed.code);
};

/**
 * Create standardized error object for Redux thunks
 * @param {Error|Object} error - Error from API call
 * @param {string} defaultMessage - Default message if extraction fails
 * @returns {Object} Error object for rejectWithValue
 */
export const createThunkError = (
  error,
  defaultMessage = "An error occurred"
) => {
  const parsed = parseError(error);

  return {
    message: parsed.message || defaultMessage,
    type: parsed.type,
    statusCode: parsed.statusCode,
    code: parsed.code,
    validationErrors: parsed.validationErrors,
    hint: parsed.hint,
    details: parsed.details,
  };
};

/**
 * Map server validation errors to form field errors
 * Useful for react-hook-form setError
 * @param {Array} validationErrors - Validation errors array
 * @param {Function} setError - react-hook-form setError function
 */
export const mapServerErrorsToForm = (validationErrors, setError) => {
  if (!validationErrors || !Array.isArray(validationErrors) || !setError) {
    return;
  }

  validationErrors.forEach((err) => {
    const fieldName = err.field || err.path || err.param;
    if (fieldName && fieldName !== "unknown") {
      setError(fieldName, {
        type: "server",
        message: err.message || "Invalid value",
      });
    }
  });
};

export default {
  parseError,
  parseToUserFriendlyMessage,
  formatValidationErrors,
  formatErrorForSnackbar,
  getErrorSeverity,
  isRecoverableError,
  requiresReauth,
  createThunkError,
  mapServerErrorsToForm,
  ErrorType,
};
