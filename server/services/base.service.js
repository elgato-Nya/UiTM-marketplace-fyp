const logger = require("../utils/logger");
const { AppError, createNotFoundError } = require("../utils/errors");

const handleServiceError = (error, operation, context = {}) => {
  logger.error(`Service error in ${operation}, ${error.message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof AppError) {
    throw error; // Re-throw known application errors
  }

  throw new AppError(
    `${operation} failed: ${error.message}`,
    500,
    "SERVICE_ERROR"
  );
};

// Helper function to handle common service errors
const handleNotFoundError = (resource, customCode, action, context = {}) => {
  logger.warn(`${resource} not found`, {
    action,
    ...context,
    timestamp: new Date().toISOString(),
  });
  throw createNotFoundError(resource, customCode);
};

// This removes sensitive fields from user object
const sanitizeUserData = (user) => {
  const { password, refreshTokens, __v, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};

/**
 * Sort Helper
 *
 * PURPOSE: Build MongoDB sort object from query parameters
 * USAGE: const sort = this.buildSort(req.query, ['name', 'createdAt']);
 */
const buildSort = (query, allowedFields = []) => {
  if (!query.sort) {
    return { createdAt: -1 }; // Default: newest first
  }

  const sortFields = query.sort.split(",");
  const sort = {};

  sortFields.forEach((field) => {
    let sortField = field.trim();
    let sortOrder = 1; // Ascending by default

    if (sortField.startsWith("-")) {
      sortOrder = -1; // Descending
      sortField = sortField.substring(1);
    }

    if (allowedFields.includes(sortField)) {
      sort[sortField] = sortOrder;
    }
  });

  return Object.keys(sort).length > 0 ? sort : { createdAt: -1 };
};

/**
 * Cache Key Generator
 *
 * PURPOSE: Generate consistent cache keys for controller actions
 * USAGE: const cacheKey = this.generateCacheKey('users', req.query);
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
 *
 * PURPOSE: Handle field selection from query parameters
 * USAGE: const select = this.buildSelect(req.query.fields, defaultFields);
 */
const buildSelect = (fieldsQuery, defaultFields = "") => {
  if (!fieldsQuery) return defaultFields;

  const fields = fieldsQuery.split(",").map((field) => field.trim());

  const excludeFields = ["-password", "-refreshTokens", "-__v"];

  return [...fields, ...excludeFields].join(" ");
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
