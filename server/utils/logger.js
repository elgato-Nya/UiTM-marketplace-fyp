// ! imported from logger.config.js not the winston package
const winston = require("../config/logger.config");
const crypto = require("crypto");

/**
 * Logger Utility Wrapper
 * Provides additional context and formatting for different use cases
 */

class Logger {
  constructor() {
    this.logger = winston;
    this.requestCounter = 0;
    this.maxDepth = 6;
    this.maxStringLength = 2000;
    this.maxArrayLength = 50;
    this.maxBufferLength = 1024;
    this.sensitiveFieldPatterns = [
      "password",
      "token",
      "accesstoken",
      "refreshtoken",
      "authorization",
      "cookie",
      "secret",
      "apikey",
      "otp",
      "pin",
      "card",
      "cvv",
    ];
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
      correlationId: req.correlationId || "undefined",
      requestId: req.requestId || "undefined",
    });
  }
  /**
   * Log an error with stack trace and optional action context
   * @param {Object} error - The error object
   * @param {Object} context - context.action and additonal context
   */
  errorWithStack(error, context = {}) {
    if (typeof error === "string") {
      const message = error;
      const errorObject = context instanceof Error ? context : undefined;
      const additionalContext =
        arguments.length >= 3 && arguments[2] && typeof arguments[2] === "object"
          ? arguments[2]
          : {};
      const logContext = {
        category: "error",
        action:
          additionalContext.action ||
          errorObject?.action ||
          "unknown_action",
        ...(errorObject ? { error: errorObject } : {}),
        ...additionalContext,
      };
      this.error(message, logContext);
      return;
    }

    const errorObject = error instanceof Error ? error : new Error(String(error));
    const logContext = {
      category: "error",
      action: context.action || errorObject.action || "unknown_action",
      error: errorObject,
      ...context,
    };

    this.error(errorObject.message, logContext);
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
    if (meta === null || meta === undefined) return {};
    return this.normalizeValue(meta);
  }

  // Sanitize request body to remove sensitive information
  sanitizeRequestBody(body) {
    return this.normalizeValue(body);
  }

  generateCorrelationId() {
    return `corr_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }

  isSensitiveKey(key) {
    if (!key) return false;
    const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    return this.sensitiveFieldPatterns.some((pattern) =>
      normalizedKey.includes(pattern),
    );
  }

  normalizeBuffer(buffer) {
    const previewBuffer =
      buffer.length > this.maxBufferLength
        ? buffer.subarray(0, this.maxBufferLength)
        : buffer;
    const utf8 = previewBuffer.toString("utf8");
    const printableRatio =
      utf8.length > 0
        ? [...utf8].filter((char) => {
            const code = char.charCodeAt(0);
            return code >= 32 && code <= 126;
          }).length / utf8.length
        : 0;
    const truncationNote =
      buffer.length > this.maxBufferLength
        ? `...[truncated ${buffer.length - this.maxBufferLength} bytes]`
        : "";
    if (printableRatio > 0.9) {
      return `${this.truncateString(utf8)}${truncationNote}`;
    }
    return `${previewBuffer.toString("hex")}${truncationNote}`;
  }

  normalizeError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.code !== undefined && { code: error.code }),
    };
  }

  isObjectIdLike(value) {
    return (
      value &&
      typeof value === "object" &&
      typeof value.toHexString === "function"
    );
  }

  truncateString(value) {
    if (typeof value !== "string") return value;
    if (value.length <= this.maxStringLength) return value;
    return `${value.slice(0, this.maxStringLength)}...[truncated ${value.length - this.maxStringLength} chars]`;
  }

  normalizeValue(value, visited = new WeakSet(), depth = 0) {
    if (value === null || value === undefined) return value;

    if (depth >= this.maxDepth) {
      return "[MaxDepthReached]";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return typeof value === "string" ? this.truncateString(value) : value;
    }

    if (typeof value === "bigint") {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return this.normalizeError(value);
    }

    if (Buffer.isBuffer(value)) {
      return this.normalizeBuffer(value);
    }

    if (this.isObjectIdLike(value)) {
      try {
        return value.toHexString();
      } catch {
        return String(value);
      }
    }

    if (Array.isArray(value)) {
      if (visited.has(value)) return "[Circular]";
      visited.add(value);
      const limited = value
        .slice(0, this.maxArrayLength)
        .map((item) => this.normalizeValue(item, visited, depth + 1));
      if (value.length > this.maxArrayLength) {
        limited.push(`[Truncated ${value.length - this.maxArrayLength} items]`);
      }
      return limited;
    }

    if (typeof value === "object") {
      if (visited.has(value)) return "[Circular]";
      visited.add(value);

      const output = {};
      Object.keys(value).forEach((key) => {
        if (this.isSensitiveKey(key)) {
          output[key] = "[REDACTED]";
          return;
        }
        output[key] = this.normalizeValue(value[key], visited, depth + 1);
      });

      if (output.timestamp) {
        delete output.timestamp;
      }

      if (Object.prototype.hasOwnProperty.call(output, "userId")) {
        if (output.userId === undefined || output.userId === "undefined") {
          output.userId = "undefined";
        }
      }

      Object.keys(output).forEach((key) => {
        const entry = output[key];
        if (Array.isArray(entry) && entry.length === 0) {
          delete output[key];
          return;
        }
        if (
          entry &&
          typeof entry === "object" &&
          !Array.isArray(entry) &&
          Object.keys(entry).length === 0
        ) {
          delete output[key];
        }
      });

      return output;
    }

    return String(value);
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
