const sanitize = require("sanitize-html");

const logger = require("../utils/logger");
const { AppError } = require("../utils/errors");

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

// This removes sensitive fields from user object
const sanitizeUserData = (user) => {
  const { password, refreshTokens, __v, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};

module.exports = {
  handleServiceError,
  sanitizeUserData,
};
