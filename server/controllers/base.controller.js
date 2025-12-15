const logger = require("../utils/logger");
const { getTokenPair } = require("../services/jwt.service");
/**
 * Base Controller Class
 *
 * PURPOSE: Provides common functionality for all controllers
 * PATTERN: Inheritance - other controllers extend this base class
 * BENEFITS:
 * - DRY principle - avoid repeating code in every controller
 * - Consistent response format across all endpoints
 * - Centralized error handling and logging
 * - Standard HTTP status codes and messages
 * - Reusable validation and pagination logic
 *
 * USAGE:
 * class UserController extends BaseController {
 *   getUserProfile = this.asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.user._id);
 *     return this.sendSuccess(res, user, "Profile retrieved successfully");
 *   });
 * }
 */
class BaseController {
  constructor() {
    // Bind methods to ensure 'this' context is maintained
    this.sendSuccess = this.sendSuccess.bind(this);
    this.sendError = this.sendError.bind(this);
    this.logAction = this.logAction.bind(this);

    // Make logger available to all child controllers
    this.logger = logger;
  }

  /**
   * PURPOSE: Standardize successful API responses
   * @param {Response} res - Express response object
   * @param {*} data - the main response data (payload, by default null)
   * @param {String} message - a descriptive message for the response (default "Operation successful")
   * @param {Number} statusCode - HTTP status code for the response (default 200)
   * @param {Object} meta - additional metadata to include in the response (default {})
   * @returns res.status(statusCode).json(response);
   */
  sendSuccess(
    res,
    data = null,
    message = "Operation successful",
    statusCode = 200,
    meta = {}
  ) {
    const response = {
      success: true,
      message,
      // Spread the data directly into the response instead of nesting it
      ...(data && typeof data === "object" && data !== null ? data : { data }),
      ...(Object.keys(meta).length > 0 && { meta }),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * PURPOSE: Send structured response with data nested in 'data' field
   * USE: For consistent client-side data access patterns
   */
  sendStructuredSuccess(
    res,
    data = null,
    message = "Operation successful",
    statusCode = 200,
    meta = {}
  ) {
    const response = {
      success: true,
      message,
      data,
      ...(Object.keys(meta).length > 0 && { meta }),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * PURPOSE: Standardize error API responses
   * @param {Response} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code (default 400)
   * @param {String} code - Error code for client handling (default "VALIDATION_ERROR")
   * @param {Array|Object} errors - Additional error details (default null)
   * @returns res.status(statusCode).json(response);
   */
  sendError(
    res,
    message = "An error occurred",
    statusCode = 400,
    code = "VALIDATION_ERROR",
    errors = null
  ) {
    const response = {
      success: false,
      message,
      code,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    };

    // Log the error for monitoring
    this.logger.warn("Controller error response", {
      message,
      code,
      statusCode,
      category: "controller_error",
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Pagination Helper
   *
   * PURPOSE: Calculate pagination values and format response
   * USAGE: const pagination = this.getPagination(req.query, totalItems);
   */
  getPagination(query, totalItems, defaultLimit = 10, maxLimit = 100) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(query.limit) || defaultLimit)
    );
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      skip,
    };
  }

  /**
   * Query Filter Helper
   *
   * PURPOSE: Build MongoDB query filters from request query
   * USAGE: const filters = this.buildFilters(req.query, ['name', 'category']);
   */
  buildFilters(query, allowedFields = []) {
    const filters = {};

    allowedFields.forEach((field) => {
      if (query[field] !== undefined) {
        // Handle different filter types
        if (query[field] === "true" || query[field] === "false") {
          filters[field] = query[field] === "true";
        } else if (!isNaN(query[field])) {
          filters[field] = Number(query[field]);
        } else {
          // Text search with case-insensitive regex
          filters[field] = { $regex: query[field], $options: "i" };
        }
      }
    });

    // Handle date ranges
    if (query.startDate || query.endDate) {
      filters.createdAt = {};
      if (query.startDate) {
        filters.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filters.createdAt.$lte = new Date(query.endDate);
      }
    }

    return filters;
  }

  /**
   * Action Logging Helper
   *
   * PURPOSE: Log controller actions with context
   * USAGE: this.logAction('get_users', req, { additional: 'context' });
   */
  logAction(action, req, additionalContext = {}) {
    const userId =
      req.user?._id?.toString?.() || req.user?.id?.toString?.() || "undefined";

    this.logger.info(`Controller action: ${action}`, {
      action,
      method: req.method,
      url: req.originalUrl,
      userId: userId.toString(),
      ip: req.ip,
      userAgent: req.headers?.["user-agent"] || "unknown",
      ...additionalContext,
      category: "controller_action",
    });
  }
}

module.exports = BaseController;
