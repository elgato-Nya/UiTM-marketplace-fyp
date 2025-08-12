const logger = require("../../utils/logger");

/**
 * Base Controller Class
 * Provides common functionality for all controllers
 */

class BaseController {
  constructor() {
    this.logger = logger;
  }

  // Standard success response
  sendSuccess(res, data, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logger.info(`Response sent: ${message}`, {
      statusCode,
      dataType: typeof data,
    });

    return res.status(statusCode).json(response);
  }

  // Standard error response
  sendError(res, error, statusCode = 500, context = {}) {
    const response = {
      success: false,
      message: error.message || "Internal server error",
      code: error.code || "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === "development") {
      response.stack = error.stack;
    }

    this.logger.errorWithStack(error, {
      statusCode,
      ...context,
    });

    return res.status(statusCode).json(response);
  }

  // Standard validation error response
  sendValidationError(res, errors, message = "Validation failed") {
    const response = {
      success: false,
      message,
      code: "VALIDATION_ERROR",
      errors,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn("Validation error occurred", {
      errors,
      message,
    });

    return res.status(400).json(response);
  }

  // Extract user info from request
  getUserInfo(req) {
    return {
      userId: req.user?.id || "anonymous",
      email: req.user?.email,
      role: req.user?.role,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };
  }

  // Async wrapper to handle try-catch automatically
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Log controller action
  logAction(action, req, additionalData = {}) {
    this.logger.info(`Controller: ${action}`, {
      action,
      ...this.getUserInfo(req),
      path: req.path,
      method: req.method,
      ...additionalData,
    });
  }
}

module.exports = BaseController;
