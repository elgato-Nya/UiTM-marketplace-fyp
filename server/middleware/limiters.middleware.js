/**
 * Centralized Rate Limiters Middleware
 *
 * Provides pre-built rate limiters and a factory function for custom limiters.
 * All rate limiters use configurations from rateLimits.config.js.
 *
 * @module middleware/limiters.middleware
 * @see config/rateLimits.config.js
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const rateLimit = require("express-rate-limit");
const { getRateLimit } = require("../config/rateLimits.config");
const logger = require("../utils/logger");

/**
 * Check if rate limiting is disabled (for security testing like OWASP ZAP)
 * Set DISABLE_RATE_LIMITING=true in .env to disable
 */
const isRateLimitingDisabled = process.env.DISABLE_RATE_LIMITING === "true";

if (isRateLimitingDisabled) {
  logger.warn("⚠️  RATE LIMITING IS DISABLED - Only use for security testing!");
}

/**
 * Standard handler for rate limit exceeded
 * Logs the event and sends consistent error response
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next (unused)
 * @param {Object} options - Rate limiter options
 */
const handleLimitReached = (req, res, next, options) => {
  const clientInfo = {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || "unknown",
    path: req.path,
    method: req.method,
    userId: req.user?.userId || "unauthenticated",
    limiterName: options._limiterName || "unknown",
    timestamp: new Date().toISOString(),
  };

  logger.warn("Rate limit exceeded", {
    clientInfo,
    limit: options.max,
    windowMs: options.windowMs,
  });

  // Calculate retry-after in seconds
  const retryAfterSec = Math.ceil(options.windowMs / 1000);

  // Set standard rate limit headers
  res.setHeader("Retry-After", retryAfterSec);

  // Send consistent error response
  res.status(429).json({
    success: false,
    message:
      options.message?.message || "Too many requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: retryAfterSec,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Create a rate limiter from configuration
 *
 * @param {string|Object} configOrName - Configuration name or custom config object
 * @param {Object} overrides - Optional overrides for the configuration
 * @returns {Function} Express rate limiter middleware
 */
const createLimiter = (configOrName, overrides = {}) => {
  // If rate limiting is disabled, return a pass-through middleware
  if (isRateLimitingDisabled) {
    return (req, res, next) => next();
  }

  // Get configuration
  const config =
    typeof configOrName === "string"
      ? getRateLimit(configOrName)
      : configOrName;

  // Merge with overrides
  const finalConfig = { ...config, ...overrides };

  // Build the rate limiter options
  const limiterOptions = {
    windowMs: finalConfig.windowMs,
    max: finalConfig.max,
    message: finalConfig.message,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: finalConfig.skipSuccessfulRequests || false,
    skipFailedRequests: finalConfig.skipFailedRequests || false,
    skip:
      finalConfig.skip ||
      ((req) => {
        // Skip health check endpoints
        const skipPaths = finalConfig.skipPaths || [];
        return skipPaths.some(
          (path) => req.path === path || req.path.startsWith(path)
        );
      }),
    handler: handleLimitReached,
    // Store limiter name for logging
    _limiterName: typeof configOrName === "string" ? configOrName : "custom",
    // Disable validation warnings - we're using IP correctly
    validate: false,
  };

  // Add custom keyGenerator only if useUserIdKey is set
  // This creates user-based rate limiting for authenticated routes
  if (finalConfig.useUserIdKey) {
    limiterOptions.keyGenerator = (req) => {
      // Use userId if authenticated, fallback to IP
      return req.user?.userId?.toString() || req.ip;
    };
  }

  // Create the rate limiter
  return rateLimit(limiterOptions);
};

// ==================== PRE-BUILT LIMITERS ====================

/**
 * Global limiter - applies to all /api/ routes
 * Highest limits, baseline protection
 */
const globalLimiter = createLimiter("global");

/**
 * Standard limiter - normal authenticated operations
 * Cart, wishlist, profile, etc.
 */
const standardLimiter = createLimiter("standard");

/**
 * Strict limiter - sensitive operations
 * Bulk updates, admin actions
 */
const strictLimiter = createLimiter("strict");

/**
 * Auth limiter - login/register attempts
 * Prevents brute force attacks
 */
const authLimiter = createLimiter("auth");

/**
 * Email limiter - email verification, resend
 * Prevents email spam
 */
const emailLimiter = createLimiter("email");

/**
 * Password reset limiter
 */
const passwordResetLimiter = createLimiter("passwordReset");

/**
 * Write limiter - create/update operations
 * Listings, orders, etc.
 */
const writeLimiter = createLimiter("write");

/**
 * Order creation limiter - very strict
 * Prevents order spam
 */
const orderCreateLimiter = createLimiter("orderCreate");

/**
 * Checkout limiter - payment processing
 */
const checkoutLimiter = createLimiter("checkout");

/**
 * Upload limiter - file uploads
 * Expensive S3 operations
 */
const uploadLimiter = createLimiter("upload");

/**
 * Contact limiter - form submissions
 * Prevents contact spam
 */
const contactLimiter = createLimiter("contact");

/**
 * Refresh limiter - manual data refresh
 * Per-user limiting
 */
const refreshLimiter = createLimiter("refresh");

/**
 * Admin refresh limiter - platform analytics
 * Per-user limiting
 */
const adminRefreshLimiter = createLimiter("adminRefresh");

/**
 * Admin standard limiter - normal admin operations
 */
const adminStandardLimiter = createLimiter("adminStandard");

/**
 * Admin strict limiter - sensitive admin operations
 */
const adminStrictLimiter = createLimiter("adminStrict");

/**
 * Public read limiter - unauthenticated browsing
 */
const publicReadLimiter = createLimiter("publicRead");

/**
 * Search limiter - search operations
 */
const searchLimiter = createLimiter("search");

// ==================== EXPORTS ====================

module.exports = {
  // Factory
  createLimiter,

  // Pre-built limiters (organized by category)

  // Global
  globalLimiter,

  // Standard tiers
  standardLimiter,
  strictLimiter,

  // Authentication
  authLimiter,
  emailLimiter,
  passwordResetLimiter,

  // Operations
  writeLimiter,
  orderCreateLimiter,
  checkoutLimiter,
  uploadLimiter,
  contactLimiter,

  // Refresh
  refreshLimiter,
  adminRefreshLimiter,

  // Admin
  adminStandardLimiter,
  adminStrictLimiter,

  // Public
  publicReadLimiter,
  searchLimiter,

  // Handler (for custom implementations)
  handleLimitReached,
};
