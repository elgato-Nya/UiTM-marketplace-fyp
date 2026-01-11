/**
 * Rate Limits Configuration
 *
 * SINGLE SOURCE OF TRUTH for all rate limiting across the platform.
 * All rate limiters should reference this configuration.
 *
 * @module config/rateLimits.config
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Development multiplier - all limits are 10x higher in development
 * to allow for testing without hitting limits constantly
 */
const DEV_MULTIPLIER = 10;

/**
 * Apply development multiplier to max requests
 * @param {number} prodMax - Production max requests
 * @returns {number} Adjusted max requests
 */
const applyDevMultiplier = (prodMax) =>
  isDevelopment ? prodMax * DEV_MULTIPLIER : prodMax;

/**
 * Standard error response format for rate limit exceeded
 * @param {string} message - User-friendly error message
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Standardized error response
 */
const createErrorResponse = (message, windowMs) => ({
  success: false,
  message,
  code: "RATE_LIMIT_EXCEEDED",
  retryAfter: Math.ceil(windowMs / 1000),
  timestamp: new Date().toISOString(),
});

/**
 * Rate Limit Definitions
 *
 * Organized by tier/use case:
 * - Tier 1: Global (highest limits, all routes)
 * - Tier 2: Standard (normal authenticated operations)
 * - Tier 3: Strict (sensitive operations)
 * - Tier 4+: Specialized (auth, email, uploads, etc.)
 */
const RATE_LIMITS = {
  // ==================== TIER 1: GLOBAL ====================
  /**
   * Global rate limiter - applies to ALL /api/ routes
   * Highest limits, serves as the baseline protection
   */
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(200),
    message: createErrorResponse(
      "Too many requests. Please try again later.",
      15 * 60 * 1000
    ),
    skipPaths: ["/health", "/api/health"], // Skip health checks
  },

  // ==================== TIER 2: STANDARD ====================
  /**
   * Standard operations - normal authenticated user actions
   * Cart, wishlist, profile updates, etc.
   */
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(100),
    message: createErrorResponse(
      "Too many requests. Please slow down and try again.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 3: STRICT ====================
  /**
   * Strict operations - sensitive actions requiring extra protection
   * Admin operations, bulk updates, etc.
   */
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(30),
    message: createErrorResponse(
      "Too many requests for this operation. Please wait before trying again.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 4: AUTHENTICATION ====================
  /**
   * Authentication - login, register attempts
   * Very strict to prevent brute force attacks
   */
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(5),
    message: createErrorResponse(
      "Too many authentication attempts. Please try again in 15 minutes.",
      15 * 60 * 1000
    ),
    skipSuccessfulRequests: true, // Don't count successful logins
  },

  /**
   * Email operations - verification, password reset
   * Prevents email spam abuse
   */
  email: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(3),
    message: createErrorResponse(
      "Too many email requests. Please try again in 15 minutes.",
      15 * 60 * 1000
    ),
  },

  /**
   * Password reset - slightly higher than email
   */
  passwordReset: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(5),
    message: createErrorResponse(
      "Too many password reset attempts. Please try again in 15 minutes.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 5: WRITE OPERATIONS ====================
  /**
   * Write operations - create/update listings, orders
   */
  write: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(50),
    message: createErrorResponse(
      "Too many write operations. Please try again later.",
      15 * 60 * 1000
    ),
  },

  /**
   * Order creation - very limited to prevent spam orders
   */
  orderCreate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(10),
    message: createErrorResponse(
      "Too many order attempts. Please wait before placing another order.",
      15 * 60 * 1000
    ),
  },

  /**
   * Checkout operations - payment processing
   */
  checkout: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(20),
    message: createErrorResponse(
      "Too many checkout attempts. Please try again later.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 6: RESOURCE-INTENSIVE ====================
  /**
   * File uploads - expensive S3 operations
   */
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(30),
    message: createErrorResponse(
      "Too many upload requests. Please wait before uploading more files.",
      15 * 60 * 1000
    ),
  },

  /**
   * Contact form submissions - prevent spam
   */
  contact: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(5),
    message: createErrorResponse(
      "Too many submissions. Please wait before sending another message.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 7: REFRESH OPERATIONS ====================
  /**
   * Manual refresh - analytics, data refresh
   * Per-user limiting using userId as key
   */
  refresh: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: applyDevMultiplier(2),
    message: createErrorResponse(
      "Please wait before refreshing again.",
      5 * 60 * 1000
    ),
    useUserIdKey: true, // Flag for middleware to use userId-based key
  },

  /**
   * Admin refresh - platform-wide analytics refresh
   */
  adminRefresh: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: applyDevMultiplier(5),
    message: createErrorResponse(
      "Platform analytics can only be refreshed a few times per period.",
      10 * 60 * 1000
    ),
    useUserIdKey: true, // Flag for middleware to use userId-based key
  },

  // ==================== TIER 8: ADMIN OPERATIONS ====================
  /**
   * Admin standard - normal admin operations
   */
  adminStandard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(100),
    message: createErrorResponse(
      "Too many admin requests. Please try again later.",
      15 * 60 * 1000
    ),
  },

  /**
   * Admin strict - sensitive admin operations (bulk updates, user management)
   */
  adminStrict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(20),
    message: createErrorResponse(
      "Too many requests for this admin operation.",
      15 * 60 * 1000
    ),
  },

  // ==================== TIER 9: PUBLIC ENDPOINTS ====================
  /**
   * Public read - unauthenticated browsing
   */
  publicRead: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(150),
    message: createErrorResponse(
      "Too many requests. Please try again later.",
      15 * 60 * 1000
    ),
  },

  /**
   * Search - search operations (can be expensive)
   */
  search: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: applyDevMultiplier(60),
    message: createErrorResponse(
      "Too many search requests. Please wait before searching again.",
      15 * 60 * 1000
    ),
  },
};

/**
 * Get rate limit configuration by name
 * @param {string} name - Rate limit name
 * @returns {Object} Rate limit configuration
 */
const getRateLimit = (name) => {
  if (!RATE_LIMITS[name]) {
    console.warn(`Rate limit '${name}' not found, using 'standard' as default`);
    return RATE_LIMITS.standard;
  }
  return RATE_LIMITS[name];
};

/**
 * Get all rate limit names (for documentation/debugging)
 * @returns {string[]} Array of rate limit names
 */
const getRateLimitNames = () => Object.keys(RATE_LIMITS);

/**
 * Check if running in development mode
 * @returns {boolean}
 */
const isDevMode = () => isDevelopment;

module.exports = {
  RATE_LIMITS,
  getRateLimit,
  getRateLimitNames,
  isDevMode,
  DEV_MULTIPLIER,
  createErrorResponse,
};
