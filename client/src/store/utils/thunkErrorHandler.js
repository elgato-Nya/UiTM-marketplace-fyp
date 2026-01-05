/**
 * Redux Thunk Error Handler Utilities
 *
 * PURPOSE: Standardize error handling across all Redux async thunks
 * USAGE: Import and use in createAsyncThunk catch blocks
 *
 * FEATURES:
 * - Consistent error object structure
 * - Automatic extraction of server validation errors
 * - User-friendly message parsing
 * - Support for both development and production server formats
 */

import { ERROR_MESSAGES } from "../../constants/errorMessages";

/**
 * Extract standardized error object from API error for Redux thunks
 *
 * @param {Error} error - Axios error or any error object
 * @param {string} defaultMessage - Default message if extraction fails
 * @returns {Object} Standardized error object for rejectWithValue
 *
 * USAGE:
 * catch (error) {
 *   return rejectWithValue(extractThunkError(error, 'Failed to create listing'));
 * }
 */
export const extractThunkError = (
  error,
  defaultMessage = "An error occurred"
) => {
  // Handle null/undefined errors
  if (!error) {
    return {
      message: defaultMessage,
      statusCode: 0,
      code: null,
      type: "unknown",
      validationErrors: null,
      hint: null,
      details: null,
    };
  }

  // Extract response data
  const response = error.response;
  const responseData = response?.data;
  const statusCode = response?.status || 0;

  // Debug logging for development
  if (process.env.NODE_ENV === "development") {
    console.log("[ThunkError] Raw error:", {
      hasResponse: !!response,
      statusCode,
      responseData,
      errorMessage: error.message,
      errorCode: error.code,
    });
  }

  // Handle development vs production server error formats
  // Development: { error: { message, code, ... } }
  // Production: { message, code, ... }
  const serverError = responseData?.error;

  // Extract error message
  const message =
    serverError?.message ||
    responseData?.message ||
    error.message ||
    defaultMessage;

  // Extract error code
  const code = serverError?.code || responseData?.code || null;

  // Extract validation errors if present
  let validationErrors = null;

  // Check for express-validator format: { errors: [...] }
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    validationErrors = responseData.errors.map((err) => ({
      field: err.field || err.path || err.param || "unknown",
      message: err.message || err.msg || "Invalid value",
      value: err.value,
      location: err.location,
    }));
  }
  // Check for error.details array
  else if (Array.isArray(serverError?.details)) {
    validationErrors = serverError.details;
  }

  // Extract hint if available
  const hint = responseData?.hint || serverError?.hint || null;

  // Determine error type from status code
  let type = "unknown";
  switch (statusCode) {
    case 400:
    case 422:
      type = "validation";
      break;
    case 401:
      type = "authentication";
      break;
    case 403:
      type = "authorization";
      break;
    case 404:
      type = "not_found";
      break;
    case 429:
      type = "rate_limit";
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      type = "server";
      break;
  }

  // Check for network errors
  if (
    !response &&
    (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
  ) {
    type = "network";
  }

  // Parse technical error messages
  const parsedMessage = parseToFriendlyMessage(message, type);

  return {
    message: parsedMessage,
    statusCode,
    code,
    type,
    validationErrors,
    hint,
    details: responseData,
  };
};

/**
 * Parse technical error messages into user-friendly text
 */
const parseToFriendlyMessage = (message, errorType) => {
  if (!message || typeof message !== "string") {
    return ERROR_MESSAGES.unknown.default;
  }

  const lowerMessage = message.toLowerCase();

  // Rate limit errors - check FIRST before other checks
  if (
    errorType === "rate_limit" ||
    lowerMessage.includes("too many") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("try again later")
  ) {
    // Check if it's a login-specific rate limit
    if (lowerMessage.includes("login") || lowerMessage.includes("auth")) {
      return ERROR_MESSAGES.rateLimit.login;
    }
    // Check if it's an email rate limit
    if (
      lowerMessage.includes("email") ||
      lowerMessage.includes("verification")
    ) {
      return ERROR_MESSAGES.rateLimit.email;
    }
    return ERROR_MESSAGES.rateLimit.default;
  }

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

  // Return original message if not technical jargon
  return message;
};

/**
 * Create a standard rejected action payload
 * Use this to ensure consistent error structure across slices
 */
export const createRejectedPayload = (error, category, operation) => {
  const defaultMessage =
    ERROR_MESSAGES[category]?.[`${operation}Failed`] ||
    ERROR_MESSAGES[category]?.default ||
    `Failed to ${operation}`;

  return extractThunkError(error, defaultMessage);
};

/**
 * Helper to get user-friendly message from thunk error state
 * Use in components to display errors from Redux state
 *
 * @param {Object} error - Error object from Redux state
 * @returns {string} User-friendly error message
 */
export const getThunkErrorMessage = (error) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || ERROR_MESSAGES.unknown.default;
};

/**
 * Helper to check if thunk error is a validation error
 */
export const isThunkValidationError = (error) => {
  if (!error) return false;
  return (
    error.type === "validation" ||
    error.statusCode === 400 ||
    error.statusCode === 422 ||
    (error.validationErrors && error.validationErrors.length > 0)
  );
};

/**
 * Helper to check if thunk error requires re-authentication
 */
export const isThunkAuthError = (error) => {
  if (!error) return false;
  return (
    error.type === "authentication" ||
    error.statusCode === 401 ||
    error.code === "INVALID_TOKEN" ||
    error.code === "TOKEN_EXPIRED" ||
    error.code === "SESSION_EXPIRED"
  );
};

/**
 * Helper to check if error is recoverable (user can retry)
 */
export const isThunkRecoverableError = (error) => {
  if (!error) return false;
  return ["network", "rate_limit", "server"].includes(error.type);
};

export default {
  extractThunkError,
  createRejectedPayload,
  getThunkErrorMessage,
  isThunkValidationError,
  isThunkAuthError,
  isThunkRecoverableError,
};
