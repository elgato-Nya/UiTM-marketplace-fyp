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
 * @param {*} user - The user object to sanitize (can be Mongoose doc or plain object)
 * @returns {Object} - The sanitized user object
 *
 * PURPOSE: Remove sensitive fields from user object before returning
 */
const sanitizeUserData = (user) => {
  // Handle both Mongoose documents and plain objects
  const userObj =
    user && typeof user.toObject === "function" ? user.toObject() : user;

  if (!userObj) return null;

  const { password, refreshTokens, __v, ...sanitizedUser } = userObj;
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
 * USAGE: const campusValue = getEnumValueByKey(CampusEnum, 'SHAH_ALAM');
 * @param {Object} enumObj - The enum object
 * @param {String} key - The enum key
 * @returns {String|null} The enum value or null if key is null/undefined
 */
const getEnumValueByKey = (enumObj, key) => {
  if (!key) return null; // ✅ CHANGED: Handle null/undefined gracefully
  return enumObj[key] || null;
};

/**
 * Convert Enum Keys to Values for Response
 *
 * PURPOSE: Convert enum keys (stored in DB) to values (sent to client)
 * LOGIC: Client sends keys -> DB stores keys -> Server retrieves keys ->
 *        This function converts keys to values -> Client receives values
 *
 * @param {Object|Array} data - Data object or array containing enum keys
 * @param {Object} enumMappings - Object mapping field paths to enum objects
 *        Example: {
 *          'campusAddress.campus': CampusEnum,
 *          'personalAddress.state': StateEnum,
 *          'status': OrderStatusEnum
 *        }
 * @returns {Object|Array} Data with enum values instead of keys
 *
 * USAGE:
 *   const address = convertEnumsToValues(addressData, {
 *     'campusAddress.campus': CampusEnum,
 *     'personalAddress.state': StateEnum
 *   });
 */
const convertEnumsToValues = (data, enumMappings = {}) => {
  if (!data) return data;

  // Handle array
  if (Array.isArray(data)) {
    return data.map((item) => convertEnumsToValues(item, enumMappings));
  }

  // Handle both Mongoose documents and plain objects
  const obj =
    data && typeof data.toObject === "function" ? data.toObject() : data;

  if (!obj || typeof obj !== "object") return obj;

  // Create a deep copy to avoid mutation
  const result = { ...obj };

  // Convert each mapped field
  for (const [fieldPath, enumObj] of Object.entries(enumMappings)) {
    const keys = fieldPath.split(".");
    let current = result;
    let parent = null;
    let lastKey = null;

    // Navigate to the field
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) break;
      parent = current;
      current = current[keys[i]];
      lastKey = keys[i];

      // Ensure we copy nested objects
      if (parent && typeof current === "object" && !Array.isArray(current)) {
        parent[lastKey] = { ...current };
        current = parent[lastKey];
      }
    }

    const finalKey = keys[keys.length - 1];

    // Convert the enum key to value if it exists
    if (current && current[finalKey]) {
      const enumValue = getEnumValueByKey(enumObj, current[finalKey]);
      if (enumValue) {
        current[finalKey] = enumValue;
      }
    }
  }

  return result;
};

/**
 * Convert Address Enum Keys to Values (Convenience wrapper)
 *
 * PURPOSE: Shorthand for converting address-specific enums
 * @param {Object|Array} data - Address object or array of addresses
 * @returns {Object|Array} Address(es) with enum values instead of keys
 */
const convertAddressEnumsToValues = (data) => {
  const { CampusEnum, StateEnum } = require("../utils/enums/user.enum");

  return convertEnumsToValues(data, {
    "campusAddress.campus": CampusEnum,
    "personalAddress.state": StateEnum,
  });
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
  convertEnumsToValues,
  convertAddressEnumsToValues,
};
