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

const logger = require("../utils/logger");

class BaseController {
  constructor() {
    // Bind methods to ensure 'this' context is maintained
    this.sendSuccess = this.sendSuccess.bind(this);
    this.sendValidationError = this.sendValidationError.bind(this);
    this.logAction = this.logAction.bind(this);

    // Make logger available to all child controllers
    this.logger = logger;
  }

  /**
   * Standard Success Response
   *
   * PURPOSE: Send consistent success responses
   * FORMAT: Always includes success flag, message, and data
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
      ...(data && { data }),
      ...(Object.keys(meta).length > 0 && { meta }),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Validation Error Response
   *
   * PURPOSE: Handle validation errors from express-validator
   * FORMAT: Includes detailed field-level errors
   */
  sendValidationError(
    res,
    validationErrors = [],
    message = "Validation failed"
  ) {
    const formattedErrors = validationErrors.map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    this.logger.warn("Validation errors in controller", {
      errors: formattedErrors,
      category: "validation_error",
    });

    return res.status(400).json({
      success: false,
      message,
      code: "VALIDATION_ERROR",
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
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
   * Action Logging Helper
   *
   * PURPOSE: Log controller actions with context
   * USAGE: this.logAction('get_users', req, { additional: 'context' });
   */
  logAction(action, req, additionalContext = {}) {
    this.logger.info(`Controller action: ${action}`, {
      action,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?._id || req.user?.id || "anonymous",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      ...additionalContext,
      category: "controller_action",
    });
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
   * Sort Helper
   *
   * PURPOSE: Build MongoDB sort object from query parameters
   * USAGE: const sort = this.buildSort(req.query, ['name', 'createdAt']);
   */
  buildSort(query, allowedFields = []) {
    if (!query.sort) {
      return { createdAt: -1 }; // Default: newest first
    }

    const sortFields = query.sort.split(",");
    const sort = {};

    sortFields.forEach((field) => {
      let sortField = field.trim();
      let sortOrder = 1; // Ascending by default

      if (sortField.startsWith("-")) {
        sortOrder = -1; // Descending
        sortField = sortField.substring(1);
      }

      if (allowedFields.includes(sortField)) {
        sort[sortField] = sortOrder;
      }
    });

    return Object.keys(sort).length > 0 ? sort : { createdAt: -1 };
  }

  /**
   * Cache Key Generator
   *
   * PURPOSE: Generate consistent cache keys for controller actions
   * USAGE: const cacheKey = this.generateCacheKey('users', req.query);
   */
  generateCacheKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Field Selection Helper
   *
   * PURPOSE: Handle field selection from query parameters
   * USAGE: const select = this.buildSelect(req.query.fields, defaultFields);
   */
  buildSelect(fieldsQuery, defaultFields = "") {
    if (!fieldsQuery) return defaultFields;

    // Split by comma and clean up
    const fields = fieldsQuery.split(",").map((field) => field.trim());

    // Always exclude sensitive fields
    const excludeFields = ["-password", "-refreshTokens", "-__v"];

    return [...fields, ...excludeFields].join(" ");
  }
}

module.exports = BaseController;
