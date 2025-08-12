const corsService = require("../services/cors.service");

/**
 * CORS Configuration
 * Pure configuration without business logic
 */

const corsOptions = {
  origin: (origin, callback) => corsService.validateOrigin(origin, callback),
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
