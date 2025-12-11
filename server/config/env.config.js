/**
 * Environment Configuration Loader
 *
 * PURPOSE: Centralized, environment-aware configuration
 * FEATURES:
 * - Validates required environment variables
 * - Provides sensible defaults for development
 * - Throws clear errors for missing production values
 * - Type conversion (string to number, boolean)
 * - Environment-specific configuration
 *
 * USAGE:
 * const config = require('./config/env.config');
 * console.log(config.database.uri);
 * console.log(config.jwt.accessSecret);
 */

const logger = require("../utils/logger");

// Environment detection
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const IS_DEVELOPMENT = NODE_ENV === "development";
const IS_TEST = NODE_ENV === "test";

/**
 * Validate required environment variable
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value for non-production
 * @returns {string} Environment variable value
 */
const requireEnv = (key, defaultValue = null) => {
  const value = process.env[key];

  if (!value) {
    if (IS_PRODUCTION) {
      throw new Error(`❌ Missing required environment variable: ${key}`);
    }

    if (defaultValue) {
      logger.warn(`⚠️  Using default value for ${key} in ${NODE_ENV} mode`);
      return defaultValue;
    }

    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value;
};

/**
 * Get optional environment variable with default
 * @param {string} key - Environment variable name
 * @param {any} defaultValue - Default value
 * @returns {string} Environment variable value or default
 */
const getEnv = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

/**
 * Parse boolean environment variable
 * @param {string} key - Environment variable name
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} Parsed boolean value
 */
const getBoolEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
};

/**
 * Parse integer environment variable
 * @param {string} key - Environment variable name
 * @param {number} defaultValue - Default value
 * @returns {number} Parsed integer value
 */
const getIntEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse float environment variable
 * @param {string} key - Environment variable name
 * @param {number} defaultValue - Default value
 * @returns {number} Parsed float value
 */
const getFloatEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Main configuration object
 */
const config = {
  // Environment
  env: NODE_ENV,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
  isTest: IS_TEST,

  // Server
  server: {
    port: getIntEnv("PORT", 5000),
    host: getEnv("HOST", "0.0.0.0"),
  },

  // Database
  database: {
    uri: requireEnv(
      "MONGO_URI",
      IS_TEST
        ? "mongodb://localhost:27017/uitm-marketplace-test"
        : "mongodb://localhost:27017/uitm-marketplace-dev"
    ),
  },

  // JWT
  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessExpiration: getEnv("JWT_ACCESS_EXPIRATION", "30m"),
    refreshExpiry: getEnv("JWT_REFRESH_EXPIRY", "7d"),
    issuer: getEnv("JWT_ISSUER", "uitm-marketplace"),
    audience: getEnv("JWT_AUDIENCE", "uitm-marketplace-users"),
  },

  // CORS
  cors: {
    allowedOrigins: getEnv(
      "ALLOWED_ORIGINS",
      IS_PRODUCTION
        ? "" // Force explicit configuration in production
        : "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  // AWS S3
  aws: {
    accessKeyId: requireEnv(
      "AWS_ACCESS_KEY_ID",
      IS_PRODUCTION ? null : "dummy-key"
    ),
    secretAccessKey: requireEnv(
      "AWS_SECRET_ACCESS_KEY",
      IS_PRODUCTION ? null : "dummy-secret"
    ),
    region: getEnv("AWS_REGION", "ap-southeast-1"),
    s3: {
      bucketName: requireEnv(
        "AWS_S3_BUCKET_NAME",
        IS_PRODUCTION ? null : "uitm-marketplace-dev"
      ),
      maxImageSize: getIntEnv("MAX_IMAGE_SIZE", 5 * 1024 * 1024), // 5MB
      allowedImageTypes: getEnv(
        "ALLOWED_IMAGE_TYPES",
        "image/jpeg,image/png,image/webp,image/jpg"
      )
        .split(",")
        .map((type) => type.trim()),
    },
  },

  // Email (AWS SES)
  email: {
    smtp: {
      host: requireEnv("SMTP_HOST", IS_PRODUCTION ? null : "smtp.example.com"),
      port: getIntEnv("SMTP_PORT", 587),
      secure: getBoolEnv("SMTP_SECURE", false),
      user: requireEnv("SMTP_USER", IS_PRODUCTION ? null : "dummy-user"),
      pass: requireEnv("SMTP_PASS", IS_PRODUCTION ? null : "dummy-pass"),
    },
    from: requireEnv("EMAIL_FROM", IS_PRODUCTION ? null : "noreply@localhost"),
    fromName: getEnv("EMAIL_FROM_NAME", "MarKet"),
    clientUrl: requireEnv(
      "CLIENT_URL",
      IS_PRODUCTION ? null : "http://localhost:3000"
    ),
  },

  // Stripe
  stripe: {
    secretKey: requireEnv(
      "STRIPE_SECRET_KEY",
      IS_PRODUCTION ? null : "sk_test_dummy"
    ),
    publishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", "pk_test_dummy"),
    webhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
    minimumAmount: getFloatEnv("STRIPE_MINIMUM_AMOUNT", 10.0),
    minimumAmountCents: getIntEnv("STRIPE_MINIMUM_AMOUNT_CENTS", 1000),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: getIntEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
    maxRequests: getIntEnv(
      "RATE_LIMIT_MAX_REQUESTS",
      IS_DEVELOPMENT ? 1000 : 100
    ),
    authMaxRequests: getIntEnv("RATE_LIMIT_AUTH_MAX_REQUESTS", 5),
  },

  // Logging
  logging: {
    enableFileLogging: getBoolEnv("ENABLE_FILE_LOGGING", IS_PRODUCTION),
    level: getEnv("LOG_LEVEL", IS_PRODUCTION ? "info" : "debug"),
  },
};

// Validate configuration on startup
const validateConfig = () => {
  const errors = [];

  // Critical production checks
  if (IS_PRODUCTION) {
    if (!config.database.uri.includes("mongodb+srv")) {
      errors.push(
        "⚠️  Production should use MongoDB Atlas (mongodb+srv://...)"
      );
    }

    if (config.cors.allowedOrigins.length === 0) {
      errors.push("❌ ALLOWED_ORIGINS must be set in production");
    }

    if (
      config.cors.allowedOrigins.some((origin) => origin.includes("localhost"))
    ) {
      errors.push("⚠️  Production CORS includes localhost origins");
    }

    if (config.jwt.accessSecret.length < 32) {
      errors.push("❌ JWT_ACCESS_SECRET must be at least 32 characters");
    }

    if (config.jwt.refreshSecret.length < 32) {
      errors.push("❌ JWT_REFRESH_SECRET must be at least 32 characters");
    }

    if (config.stripe.secretKey.includes("test")) {
      errors.push("⚠️  Using Stripe test key in production");
    }
  }

  return errors;
};

// Run validation
const validationErrors = validateConfig();

if (validationErrors.length > 0) {
  logger.warn("Configuration validation warnings:", {
    environment: NODE_ENV,
    errors: validationErrors,
  });

  // In production, treat errors as critical
  if (IS_PRODUCTION && validationErrors.some((err) => err.startsWith("❌"))) {
    throw new Error(
      `Production configuration errors:\n${validationErrors.join("\n")}`
    );
  }
}

// Log configuration summary (without sensitive data)
logger.info(
  `Environment: ${NODE_ENV} | Port: ${config.server.port} | Database: Connected | CORS: ${config.cors.allowedOrigins.length} origin(s)`
);

module.exports = config;
