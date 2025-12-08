const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

/**
 * Rate Limiter Middleware Factory
 *
 * PURPOSE: Create customizable rate limiters for different routes
 * USAGE: const limiter = createRateLimiter({ windowMs: 15min, max: 100 });
 */

/**
 * Create a standardized response object for rate limit errors
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @returns {Object} Response object
 */
const createLimiterResponse = (message, code) => ({
  success: false,
  message,
  code,
  retryAfter: 15 * 60 * 1000, // 15 minutes default
  timestamp: new Date().toISOString(),
});

/**
 * Handle rate limit exceeded event
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @param {Object} options - Rate limiter options
 */
const handleLimitReached = (req, res, next, options) => {
  const clientInfo = {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || "unknown",
    path: req.path,
    method: req.method,
    userId: req.user?.id || "unauthenticated",
    timestamp: new Date().toISOString(),
  };

  logger.warn("Rate limit exceeded", { clientInfo, limit: options.max });

  // Send 429 Too Many Requests response
  res
    .status(429)
    .json(
      createLimiterResponse(
        options.message || "Too many requests, please try again later.",
        "RATE_LIMIT_EXCEEDED"
      )
    );
};

/**
 * Create a custom rate limiter with specified options
 * @param {Object} options - Rate limiter configuration
 * @param {Number} options.windowMs - Time window in milliseconds
 * @param {Number} options.max - Maximum requests per window
 * @param {String} options.message - Custom error message
 * @param {Boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {Boolean} options.skipFailedRequests - Skip counting failed requests
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests per window default
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const isDevelopment = process.env.NODE_ENV === "development";

  return rateLimit({
    windowMs,
    max: isDevelopment ? max * 10 : max, // 10x higher limit in development
    message: createLimiterResponse(message, "RATE_LIMIT_EXCEEDED"),
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    trustProxy: process.env.NODE_ENV === "production",
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: handleLimitReached,
  });
};

module.exports = {
  createRateLimiter,
  handleLimitReached,
  createLimiterResponse,
};
