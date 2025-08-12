const logger = require("../utils/logger");

/**
 * CORS Business Logic Service
 * Handles origin validation and environment-specific logic
 */

class CorsService {
  constructor() {
    this.allowedOrigins = this.initializeAllowedOrigins();
  }

  initializeAllowedOrigins() {
    const nodeEnv = process.env.NODE_ENV || "development";

    // Get origins from environment or use defaults
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
      const origins = envOrigins.split(",").map((origin) => origin.trim());
      logger.info(`CORS: Using origins from environment`, {
        origins,
        environment: nodeEnv,
      });
      return origins;
    }

    // Environment-specific defaults (act as fallback if not set in .env)
    const defaultOrigins = {
      development: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
      ],
      staging: [
        "https://staging.yourdomain.com",
        "http://localhost:3000", // For testing
      ],
      production: ["https://yourdomain.com", "https://www.yourdomain.com"],
      test: ["http://localhost:3000"],
    };

    const origins = defaultOrigins[nodeEnv] || defaultOrigins.development;
    logger.info(`CORS: Using default origins for ${nodeEnv}`, { origins });

    return origins;
  }

  isOriginAllowed(origin) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      logger.debug("CORS: Allowing request with no origin");
      return true;
    }

    const isAllowed = this.allowedOrigins.includes(origin);

    if (isAllowed) {
      logger.debug("CORS: Origin allowed", { origin });
    } else {
      logger.logSecurityEvent("CORS violation", "medium", {
        origin,
        allowedOrigins: this.allowedOrigins,
        action: "blocked_origin",
      });
    }

    return isAllowed;
  }

  validateOrigin(origin, callback) {
    if (this.isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      const error = new Error(`Origin ${origin} not allowed by CORS policy`);
      error.code = "CORS_ORIGIN_NOT_ALLOWED";
      callback(error);
    }
  }

  // Method to dynamically update allowed origins (for admin features)
  updateAllowedOrigins(newOrigins) {
    this.allowedOrigins = newOrigins;
    logger.info("CORS: Updated allowed origins", { origins: newOrigins });
  }

  getAllowedOrigins() {
    return [...this.allowedOrigins]; // Return copy to prevent mutation
  }
}

module.exports = new CorsService();
