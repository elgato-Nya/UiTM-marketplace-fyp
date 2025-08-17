const sanitize = require("sanitize-html");

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

// For objects, recursively sanitize string fields
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

// For arrays, recursively sanitize each item
const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;

  return arr.map((item) => {
    if (typeof item === "string") {
      return sanitizeInput(item);
    } else if (Array.isArray(item)) {
      return sanitizeArray(item);
    } else if (typeof item === "object" && item !== null) {
      return sanitizeObject(item);
    } else {
      return item;
    }
  });
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeArray,
};
