const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

/**
 * Rate Limiting Configuration
 *
 * ⚠️  PRODUCTION WARNING:
 * Currently using in-memory store (MemoryStore) which does NOT work across
 * multiple server instances or PM2 clusters!
 *
 * TODO: For production deployment with multiple EC2 instances:
 * 1. Install: npm install rate-limit-redis redis
 * 2. Create Redis instance (AWS ElastiCache or local)
 * 3. Replace MemoryStore with RedisStore (see implementation below)
 *
 * Example Redis store setup:
 * ```
 * const RedisStore = require('rate-limit-redis');
 * const Redis = require('redis');
 * const redisClient = Redis.createClient({
 *   host: process.env.REDIS_HOST || 'localhost',
 *   port: process.env.REDIS_PORT || 6379,
 * });
 *
 * store: new RedisStore({
 *   client: redisClient,
 *   prefix: 'rl:', // Rate limit prefix
 * })
 * ```
 */

const isDevelopment = process.env.NODE_ENV === "development";

const createLimiterResponse = (message, code, retryAfter) => ({
  success: false,
  message,
  code,
  retryAfter: Math.ceil(retryAfter / 1000), // Convert to seconds
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

  // Calculate retry-after in seconds
  const retryAfterMs = options.windowMs || 15 * 60 * 1000;
  const retryAfterSec = Math.ceil(retryAfterMs / 1000);

  // Set standard rate limit headers
  res.setHeader("Retry-After", retryAfterSec);

  // Send the response
  res
    .status(429)
    .json(
      createLimiterResponse(
        "Too many requests, please try again later.",
        "RATE_LIMIT_EXCEEDED",
        retryAfterMs
      )
    );
};
const generalLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? process.env.RATE_LIMIT_MAX_REQUESTS || 1000 : 100, // Higher limit in development
  message: createLimiterResponse(
    "Too many requests, please try again later.",
    "RATE_LIMIT_EXCEEDED",
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
  ),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // trust proxy is set globally in index.js
  skip: (req) => req.path === "/health", // Skip health checks
  handler: handleLimitReached,
  // Use a store for production (WARNING: memory store doesn't work with clusters)
  // TODO: Implement Redis store for production deployment
  skipFailedRequests: false, // Count failed requests (prevent brute force)
  skipSuccessfulRequests: false,
});

const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || 5,
  message: createLimiterResponse(
    "Too many authentication attempts, please try again later.",
    "RATE_LIMIT_EXCEEDED",
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: handleLimitReached,
});

module.exports = {
  generalLimiter,
  authLimiter,
};
