// TODO: TRY TO USE THIS FILE FOR ERROR HANDLING

/**
 * Error Utilities and Helper Functions
 *
 * PURPOSE: Centralize error creation with predefined types and logging
 */
const AppError = require("./AppError");

/**
 * Creates a validation error
 * @param {String} message - Error message
 * @param {Array} details - Validation error details (optional)
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 400 Bad Request AppError
 */
const createValidationError = (message, details = [], customCode = null) => {
  const error = new AppError(message, 400, customCode || "VALIDATION_ERROR");
  error.details = details;
  throw error;
};

/**
 * Creates an authentication error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 401 Authentication error
 */
const createAuthError = (
  message = "Authentication failed",
  customCode = null
) => {
  throw new AppError(message, 401, customCode || "AUTH_ERROR");
};

/**
 * Creates a forbidden error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 403 Forbidden AppError
 */
const createForbiddenError = (
  message = "Access forbidden",
  customCode = null
) => {
  throw new AppError(message, 403, customCode || "FORBIDDEN_ERROR");
};

/**
 * Creates a not found error
 * @param {String} resource - Where the resource was not found
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 404 Not Found AppError
 */
const createNotFoundError = (resource = "Resource", customCode = null) => {
  throw new AppError(`${resource} not found`, 404, customCode || "NOT_FOUND");
};

/**
 * Creates a conflict error for duplicate resources
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throw {AppError} Throws a 409 Conflict AppError
 */
const createConflictError = (
  message = "Resource already exists",
  customCode = null
) => {
  throw new AppError(message, 409, customCode || "CONFLICT_ERROR");
};

/**
 * Creates a server error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 500 Internal Server Error AppError
 */
const createServerError = (
  message = "Internal server error",
  customCode = null
) => {
  throw new AppError(message, 500, customCode || "SERVER_ERROR");
};

/**
 * Creates a bad request error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 400 Bad Request AppError
 */
const createBadRequestError = (message = "Bad request", customCode = null) => {
  throw new AppError(message, 400, customCode || "BAD_REQUEST");
};

/**
 * Creates a too many requests error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @throws {AppError} Throws a 429 Too Many Requests AppError
 */
const createTooManyRequestsError = (
  message = "Too many requests",
  customCode = null
) => {
  throw new AppError(message, 429, customCode || "TOO_MANY_REQUESTS");
};

/**
 * Creates a duplicate error
 * @param {String} message - Error message
 * @param {String} customCode - Custom error code (optional)
 * @param {String} action - Action that the error originated from (optional)
 * @throws {AppError} Throws a 409 Conflict AppError
 */
const createDuplicateError = (
  message = "Resource already exists",
  customCode = null,
  action = null
) => {
  const error = new AppError(message, 409, customCode || "DUPLICATE_FIELD");
  if (action) {
    error.action = action;
  }
  throw error;
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
  createDuplicateError,
};
