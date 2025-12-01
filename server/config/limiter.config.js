const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const isDevelopment = process.env.NODE_ENV === "development";

const createLimiterResponse = (message, code) => ({
  success: false,
  message,
  code,
  retryAfter: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  timestamp: new Date().toISOString(),
});

const handleLimitReached = (req, res, next, options) => {
  const clientInfo = {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || "unknown",
    path: req.path,
    timestamp: new Date().toISOString(),
  };

  logger.warn("Rate limit exceeded", { clientInfo });

  // Send the response
  res
    .status(429)
    .json(
      createLimiterResponse(
        "Too many requests, please try again later.",
        "RATE_LIMIT_EXCEEDED"
      )
    );
};
const generalLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? process.env.RATE_LIMIT_MAX_REQUESTS || 1000 : 100, // Higher limit in development
  message: createLimiterResponse(
    "Too many requests, please try again later.",
    "RATE_LIMIT_EXCEEDED"
  ),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: process.env.NODE_ENV === "production",
  skip: (req) => req.path === "/health", // Skip health checks
  handler: handleLimitReached,
});

const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || 5,
  message: createLimiterResponse(
    "Too many requests, please try again later.",
    "RATE_LIMIT_EXCEEDED"
  ),
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === "production",
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: handleLimitReached,
});

module.exports = {
  generalLimiter,
  authLimiter,
};
