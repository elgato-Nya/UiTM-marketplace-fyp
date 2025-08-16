// TODO: TRY TO USE THIS FILE FOR ERROR HANDLING

/**
 * Error Utilities and Helper Functions
 *
 * PURPOSE: Centralize error creation with predefined types
 *
 * BENEFITS:
 * - Consistent error messages and codes
 * - Easy error creation with helper functions
 * - Standardized HTTP status codes
 * - Type safety for common error scenarios
 */

const AppError = require("./AppError");

// Predefined error creators for common scenarios
const createValidationError = (message, details = [], customCode = null) => {
  const error = new AppError(message, 400, customCode || "VALIDATION_ERROR");
  error.details = details;
  return error;
};

const createAuthError = (
  message = "Authentication failed",
  customCode = null
) => {
  return new AppError(message, 401, customCode || "AUTH_ERROR");
};

const createForbiddenError = (
  message = "Access forbidden",
  customCode = null
) => {
  return new AppError(message, 403, customCode || "FORBIDDEN_ERROR");
};

const createNotFoundError = (resource = "Resource", customCode = null) => {
  return new AppError(`${resource} not found`, 404, customCode || "NOT_FOUND");
};

const createConflictError = (
  message = "Resource already exists",
  customCode = null
) => {
  return new AppError(message, 409, customCode || "CONFLICT_ERROR");
};

const createServerError = (
  message = "Internal server error",
  customCode = null
) => {
  return new AppError(message, 500, customCode || "SERVER_ERROR");
};

const createBadRequestError = (message = "Bad request", customCode = null) => {
  return new AppError(message, 400, customCode || "BAD_REQUEST");
};

const createTooManyRequestsError = (
  message = "Too many requests",
  customCode = null
) => {
  return new AppError(message, 429, customCode || "TOO_MANY_REQUESTS");
};

module.exports = {
  AppError,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createServerError,
  createBadRequestError,
  createTooManyRequestsError,
};
