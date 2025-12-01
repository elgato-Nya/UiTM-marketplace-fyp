const sanitize = require("sanitize-html");
const { ObjectId } = require("mongoose").Types;

/**
 * PURPOSE: Remove MongoDB operators from keys to prevent NoSQL injection
 * @param {string} key - Object key to check
 * @returns {boolean} True if key contains dangerous operators
 */
const containsMongoOperator = (key) => {
  if (typeof key !== "string") return false;
  return /^\$|\..*\$/.test(key); // Matches keys starting with $ or containing .something$
};

/**
 * PURPOSE: Sanitize a single input string
 * @param {any} input - The input to sanitize
 * @returns {any} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove all HTML tags and normalize whitespace
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * PURPOSE: Recursively sanitize all string fields in an object and remove MongoDB operators
 * Prevents NoSQL injection by removing keys that start with $ or contain prohibited operators
 * @param {Object} obj - The object to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} options.removeOperators - Remove MongoDB operators (default: true)
 * @param {boolean} options.sanitizeStrings - Sanitize string values (default: true)
 * @returns {Object} Sanitized object - all string fields sanitized, dangerous keys removed
 */
const sanitizeObject = (obj, options = {}) => {
  const { removeOperators = true, sanitizeStrings = true } = options;

  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof ObjectId) return obj; // Skip MongoDB ObjectId
  if (obj instanceof Date) return obj; // Skip Date objects

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  const sanitized = {};
  Object.keys(obj).forEach((key) => {
    // Remove keys with MongoDB operators to prevent NoSQL injection
    if (removeOperators && containsMongoOperator(key)) {
      // Skip this key entirely - don't include it in sanitized object
      return;
    }

    const value = obj[key];

    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeStrings ? sanitizeInput(value) : value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => sanitizeObject(item, options));
    } else if (typeof value === "object") {
      const sanitizedNested = sanitizeObject(value, options);

      // If nested object has MongoDB operators in ALL its keys, don't include parent key
      const hasOnlyOperators =
        Object.keys(value).length > 0 &&
        Object.keys(value).every(
          (k) => removeOperators && containsMongoOperator(k)
        );

      // Only add if: sanitized object has keys OR original object was empty
      if (
        Object.keys(sanitizedNested).length > 0 ||
        Object.keys(value).length === 0 ||
        !hasOnlyOperators
      ) {
        sanitized[key] = sanitizedNested;
      }
      // else: skip this key entirely because all nested keys were operators
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

/**
 * PURPOSE: Sanitize arrays by recursively sanitizing each item
 * @param {Array} arr - The array to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Array} Sanitized array
 */
const sanitizeArray = (arr, options = {}) => {
  if (!Array.isArray(arr)) return arr;

  return arr.map((item) => {
    if (typeof item === "string") {
      return sanitizeInput(item);
    } else if (Array.isArray(item)) {
      return sanitizeArray(item, options);
    } else if (typeof item === "object" && item !== null) {
      return sanitizeObject(item, options);
    } else {
      return item;
    }
  });
};

/**
 * PURPOSE: Sanitize request query parameters (common NoSQL injection vector)
 * @param {Object} query - Express req.query object
 * @returns {Object} Sanitized query object with operators removed
 */
const sanitizeQuery = (query) => {
  return sanitizeObject(query, {
    removeOperators: true,
    sanitizeStrings: true,
  });
};

/**
 * PURPOSE: Sanitize request body
 * @param {Object} body - Express req.body object
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized body object
 */
const sanitizeBody = (body, options = {}) => {
  return sanitizeObject(body, {
    removeOperators: true,
    sanitizeStrings: true,
    ...options,
  });
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeArray,
  sanitizeQuery,
  sanitizeBody,
  containsMongoOperator, // Export for testing
};
