const corsService = require("../services/cors.service");

/**
 * CORS Configuration
 * Pure configuration without business logic
 *
 * Note: In development we allow all origins to avoid accidental preflight
 * failures while working locally (e.g. localhost:3000 -> localhost:5000).
 * This is intentionally permissive for local development only and
 * should NOT be used in production.
 */

const isDevelopment = (process.env.NODE_ENV || "development") === "development";

const corsOptions = {
  // If in development, allow all origins to simplify local testing.
  // In production we use the corsService validator which checks allowed origins.
  origin: isDevelopment
    ? true
    : (origin, callback) => corsService.validateOrigin(origin, callback),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
  ],
  exposedHeaders: [
    "X-Total-Count",
    "X-Rate-Limit-Remaining",
    "X-Rate-Limit-Reset",
  ],
  maxAge: 86400, // 24 hours preflight cache
};

module.exports = corsOptions;
