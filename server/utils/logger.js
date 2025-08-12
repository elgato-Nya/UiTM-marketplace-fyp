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

  // Security events
  security(event, details = {}) {
    this.warn(`Security: ${event}`, {
      category: "security",
      timestamp: new Date().toISOString(),
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
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || "anonymous",
    });
  }

  // Error with stack trace and optional action context
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
    return {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      ...meta,
    };
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
      event,
      severity,
      category: "security",
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userAgent: details.userAgent,
      userId: details.userId || "anonymous",
      ...details,
    };

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
