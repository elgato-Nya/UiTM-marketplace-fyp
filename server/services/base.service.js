const logger = require("../utils/logger");
const { AppError, createNotFoundError } = require("../utils/errors");

/**
 * Handle service errors
 * @param {*} error - The error object caught
 * @param {*} operation - Name of the operation where the error occurred
 * @param {*} context - Additional optional context for logging
 * @throws {AppError} Throws an AppError for known issues or unexpected errors
 *
 * PURPOSE: Catch, then log and throw unexpected errors in service layer
 */
const handleServiceError = (error, operation, context = {}) => {
  if (error instanceof AppError) {
    throw error; // Re-throw known application errors
  }

  // For MongoDB/Mongoose errors, let the global error handler deal with them
  // This includes duplicate key errors, validation errors, etc.
  // Don't log here as global error handler will log with full context
  if (
    error.name === "MongoError" ||
    error.name === "MongoServerError" ||
    error.name === "MongooseError" ||
    error.name === "ValidationError" ||
    error.code === 11000 ||
    (error.message &&
      (error.message.includes("already exists") ||
        error.message.includes("E11000")))
  ) {
    throw error; // Pass through to global error handler
  }

  // Log only unexpected errors that won't be handled by global error handler
  logger.error(`Service error in ${operation}: ${error.message}`, {
    ...context,
    errorCode: error.code,
    errorName: error.name,
    timestamp: new Date().toISOString(),
  });

  // Generic service error for unexpected issues
  throw new AppError(
    `${operation} failed: ${error.message}`,
    500,
    "SERVICE_ERROR"
  );
};

/**
 * Handle Not Found Errors with Logging
 * @param {String} resource - The resource that was not found
 * @param {String} customCode - Custom error code (optional)
 * @param {String} action - The action being performed
 * @param {Object} context - Additional context for logging (optional)
 * @throws {AppError} Throws a createNotFoundError
 *
 * PURPOSE: Standardize not found error handling and logging
 */
const handleNotFoundError = (resource, customCode, action, context = {}) => {
  logger.warn(`${resource} not found`, {
    action,
    ...context,
    timestamp: new Date().toISOString(),
  });
  createNotFoundError(resource, customCode);
};

/**
 * Sanitize user data by removing sensitive fields
 * @param {*} user - The user object to sanitize
 * @returns {Object} - The sanitized user object
 *
 * PURPOSE: Remove sensitive fields from user object before returning AND set toObject
 */
const sanitizeUserData = (user) => {
  const { password, refreshTokens, __v, ...sanitizedUser } = user;
  return sanitizedUser;
};

/**
 * PURPOSE: Build a Mongoose sort object from query parameters with 5 limit sort fields
 * @param {Object} query - The query object containing sort parameters
 * @param {String} query.sort - Comma-separated fields with optional '-' prefix for descending
 * @param {Array<String>} allowedFields - List of fields allowed for sorting
 * @returns {Object} Mongoose sort object - e.g., { field1: 1, field2: -1 }
 */
const buildSort = (query = {}, allowedFields = []) => {
  const MAX_SORT_FIELDS = 5; // Limit to prevent abuse
  if (!query || !query.sort) {
    return { createdAt: -1 }; // Default: newest first
  }

  const sortFields = query.sort.split(",").slice(0, MAX_SORT_FIELDS); // Limit number of fields
  const sort = {};

  sortFields.forEach((field) => {
    let sortField = field.trim();
    let sortOrder = 1; // Ascending by default

    if (sortField.startsWith("-")) {
      sortOrder = -1; // Descending
      sortField = sortField.substring(1);
    }

    // Ensure allowedFields is an array before using includes
    if (Array.isArray(allowedFields) && allowedFields.includes(sortField)) {
      sort[sortField] = sortOrder;
    }
  });

  return Object.keys(sort).length > 0 ? sort : { createdAt: -1 };
};

/**
 * Cache Key Generator
 * @param {String} prefix
 * @param {Object} params
 * @returns {String} Unique cache key
 *
 * PURPOSE: Generate a unique cache key based on parameters
 */
const generateCacheKey = (prefix, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};
/**
 * Field Selection Helper
 * @param {String} fieldsQuery - comma-separated string fields to include
 * @param {Array<String>} excludeFields - selected fields to exclude (optional)
 * @returns {String} Space-separated fields for Mongoose select
 * PURPOSE: Build a select string for Mongoose queries, excluding sensitive fields
 */
const buildSelect = (fieldsQuery, excludeFields = []) => {
  const fields = fieldsQuery.split(",").map((field) => field.trim());

  const forbiddenFields = ["-password", "-refreshTokens", "-__v"];

  const exclude =
    excludeFields && excludeFields.length > 0 ? excludeFields : forbiddenFields;
  return [...fields, ...exclude].join(" ");
};

/**
 * Returns Enum Key by Value
 *
 * PURPOSE: Get enum key from value
 * USAGE: const campusKey = this.getEnumKeyByValue(CampusEnum, 'Main Campus');
 */
const getEnumKeyByValue = (enumObj, value) => {
  return Object.keys(enumObj).find((key) => enumObj[key] === value);
};

/**
 * Returns Enum Value by Key
 *
 * PURPOSE: Get enum value from key
 * USAGE: const campusValue = this.getEnumValueByKey(CampusEnum, 'MAIN');
 */
const getEnumValueByKey = (enumObj, key) => {
  return enumObj[key] || null;
};
module.exports = {
  handleServiceError,
  handleNotFoundError,
  sanitizeUserData,
  buildSort,
  generateCacheKey,
  buildSelect,
  getEnumKeyByValue,
  getEnumValueByKey,
};
