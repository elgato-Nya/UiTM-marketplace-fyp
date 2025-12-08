// ! imported from logger.config.js not the winston package
const winston = require("../config/logger.config");

/**
 * Logger Utility Wrapper
 * Provides additional context and formatting for different use cases
 */

class Logger {
  constructor() {
    this.logger = winston;
    this.requestCounter = 0;
  }

  // Basic logging methods
  info(message, meta = {}) {
    this.logger.info(message, this.formatMeta(meta));
  }

  error(message, meta = {}) {
    this.logger.error(message, this.formatMeta(meta));
  }

  warn(message, meta = {}) {
    this.logger.warn(message, this.formatMeta(meta));
  }

  debug(message, meta = {}) {
    this.logger.debug(message, this.formatMeta(meta));
  }

  http(message, meta = {}) {
    this.logger.http(message, this.formatMeta(meta));
  }

  // Specialized logging methods for common scenarios

  // Database operations
  database(action, details = {}) {
    this.info(`Database: ${action}`, {
      category: "database",
      ...details,
    });
  }

  // Authentication events
  auth(action, userId, details = {}) {
    this.info(`Auth: ${action}`, {
      category: "authentication",
      userId,
      ...details,
    });
  }

  /**
   * @param {String} event
   * @param {Object} details
   * @note log warn `Security" ${event}` with additional details
   */
  security(event, details = {}) {
    this.warn(`Security: ${event}`, {
      category: "security",
      ...details,
    });
  }

  // API requests
  request(req, res, responseTime) {
    this.http(`${req.method} ${req.originalUrl}`, {
      category: "http",
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers?.["user-agent"] || "unknown",
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || "undefined",
    });
  }
  /**
   * Log an error with stack trace and optional action context
   * @param {Object} error - The error object
   * @param {Object} context - context.action and additonal context
   */
  errorWithStack(error, context = {}) {
    const logContext = {
      category: "error",
      stack: error.stack,
      action: context.action || error.action || "unknown_action",
      ...context,
    };

    this.error(error.message, logContext);
  }

  // Performance monitoring
  performance(operation, duration, details = {}) {
    this.info(`Performance: ${operation}`, {
      category: "performance",
      duration: `${duration}ms`,
      ...details,
    });
  }

  // Format metadata for consistent structure
  formatMeta(meta) {
    // Clean and standardize the meta object
    const cleanMeta = this.sanitizeMeta(meta);

    // Don't add nodeEnv automatically - let callers add it if needed
    // This reduces log verbosity
    return cleanMeta;
  }

  // Sanitize metadata to prevent sensitive data leakage and ensure consistency
  sanitizeMeta(meta) {
    const sanitized = { ...meta };

    // Remove or sanitize sensitive fields
    if (sanitized.body) {
      sanitized.body = this.sanitizeRequestBody(sanitized.body);
    }

    // Remove duplicate timestamp if exists (formatMeta doesn't add timestamp anymore)
    if (sanitized.timestamp) {
      delete sanitized.timestamp;
    }

    // Only standardize userId field if it was explicitly provided
    // Don't add userId to logs where it wasn't originally intended
    if (sanitized.hasOwnProperty("userId")) {
      if (sanitized.userId === "undefined" || sanitized.userId === undefined) {
        sanitized.userId = "undefined";
      }
    }

    // Remove empty objects and arrays
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key];
      if (
        value &&
        typeof value === "object" &&
        Object.keys(value).length === 0
      ) {
        delete sanitized[key];
      }
      if (Array.isArray(value) && value.length === 0) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  // Sanitize request body to remove sensitive information
  sanitizeRequestBody(body) {
    if (!body || typeof body !== "object") return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = [
      "password",
      "confirmPassword",
      "token",
      "refreshToken",
    ];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeRequestBody(sanitized[key]);
      }
    });

    return sanitized;
  }

  // Create child logger with persistent context
  createChild(defaultMeta) {
    return {
      info: (message, meta = {}) =>
        this.info(message, { ...defaultMeta, ...meta }),
      error: (message, meta = {}) =>
        this.error(message, { ...defaultMeta, ...meta }),
      warn: (message, meta = {}) =>
        this.warn(message, { ...defaultMeta, ...meta }),
      debug: (message, meta = {}) =>
        this.debug(message, { ...defaultMeta, ...meta }),
      http: (message, meta = {}) =>
        this.http(message, { ...defaultMeta, ...meta }),
    };
  }

  // Measure execution time of async operations
  async measureTime(operation, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.performance(operation, duration);

      // Alert if operation is too slow (over 5 seconds)
      if (duration > 5000) {
        this.warn(`Slow operation detected: ${operation}`, { duration });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Operation failed: ${operation}`, {
        duration,
        error: error.message,
        category: "performance",
      });
      throw error;
    }
  }

  // Log security events with standardized format
  logSecurityEvent(event, severity, details = {}) {
    const logData = {
      category: "security",
      event,
      severity,
      ip: details.ip,
      userAgent: details.userAgent,
      userId: details.userId || "undefined",
      ...details,
    };

    // Remove duplicate fields that are passed in details
    delete logData.event; // Already in the message
    delete logData.severity; // Already in the message

    if (severity === "high") {
      this.error(`Security Alert: ${event}`, logData);
    } else if (severity === "medium") {
      this.warn(`Security Warning: ${event}`, logData);
    } else {
      this.info(`Security Info: ${event}`, logData);
    }
  }
}

module.exports = new Logger();
