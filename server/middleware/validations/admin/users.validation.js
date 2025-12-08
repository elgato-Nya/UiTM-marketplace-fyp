const { body, param, query, validationResult } = require("express-validator");
const { AppError } = require("../../../utils/errors");

/**
 * Admin User Management Validation Middleware
 */

/**
 * Validate MongoDB ObjectId
 */
const validateUserId = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

/**
 * Validate update status request
 */
const validateUpdateStatus = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  body("suspend").isBoolean().withMessage("Suspend must be a boolean value"),
  body("reason")
    .if(body("suspend").equals("true"))
    .notEmpty()
    .withMessage("Reason is required for suspension")
    .isString()
    .withMessage("Reason must be a string")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

/**
 * Validate update roles request
 */
const validateUpdateRoles = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  body("roles")
    .isArray({ min: 1 })
    .withMessage("Roles must be a non-empty array"),
  body("roles.*")
    .isIn(["consumer", "merchant", "admin"])
    .withMessage("Invalid role. Must be: consumer, merchant, or admin"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

/**
 * Validate pagination and filters
 */
const validateFilters = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  // Role filter - accepts single value or array
  query("role")
    .optional()
    .customSanitizer((value) => {
      // Convert to array if not already
      return Array.isArray(value) ? value : [value];
    })
    .custom((values) => {
      const validRoles = ["all", "consumer", "merchant", "admin"];
      return values.every((val) => validRoles.includes(val));
    })
    .withMessage(
      "Invalid role filter. Must be: all, consumer, merchant, or admin"
    ),
  // Status filter - accepts single value or array
  query("status")
    .optional()
    .customSanitizer((value) => {
      // Convert to array if not already
      return Array.isArray(value) ? value : [value];
    })
    .custom((values) => {
      const validStatuses = ["all", "active", "suspended"];
      return values.every((val) => validStatuses.includes(val));
    })
    .withMessage("Invalid status filter. Must be: all, active, or suspended"),
  // Campus filter - accepts single value or array
  query("campus")
    .optional()
    .customSanitizer((value) => {
      // Convert to array if not already
      return Array.isArray(value) ? value : [value];
    })
    .custom((values) => {
      const validCampuses = [
        "all",
        "SHAH_ALAM",
        "PUNCAK_ALAM",
        "PUNCAK_PERDANA",
        "DENGKIL",
        "SERI_ISKANDAR",
        "ARAU",
        "PULAU_PINANG",
        "BERTAM",
        "BANDARAYA_MELAKA",
        "ALOR_GAJAH",
        "JASIN",
        "SEGAMAT",
        "PASIR_GUDANG",
        "JENGKA",
        "DUNGUN",
        "RAUB",
        "REMBAU",
        "KUALA_PILAH",
        "SEREMBAN",
      ];
      return values.every((val) => validCampuses.includes(val));
    })
    .withMessage("Invalid campus filter"),
  query("verified")
    .optional()
    .isBoolean()
    .withMessage("Verified must be a boolean")
    .toBoolean(),
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

/**
 * Validate search query
 */
const validateSearch = [
  query("q")
    .notEmpty()
    .withMessage("Search query (q) is required")
    .isString()
    .withMessage("Search query must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),
  // Role filter - accepts single value or array
  query("role")
    .optional()
    .customSanitizer((value) => {
      return Array.isArray(value) ? value : [value];
    })
    .custom((values) => {
      const validRoles = ["all", "consumer", "merchant", "admin"];
      return values.every((val) => validRoles.includes(val));
    })
    .withMessage(
      "Invalid role filter. Must be: all, consumer, merchant, or admin"
    ),
  // Status filter - accepts single value or array
  query("status")
    .optional()
    .customSanitizer((value) => {
      return Array.isArray(value) ? value : [value];
    })
    .custom((values) => {
      const validStatuses = ["all", "active", "suspended"];
      return values.every((val) => validStatuses.includes(val));
    })
    .withMessage("Invalid status filter. Must be: all, active, or suspended"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

/**
 * Validate bulk update request
 */
const validateBulkUpdate = [
  body("userIds")
    .isArray({ min: 1, max: 50 })
    .withMessage("UserIds must be an array with 1-50 items"),
  body("userIds.*")
    .isMongoId()
    .withMessage("Each userId must be a valid MongoDB ObjectId"),
  body("action.type")
    .notEmpty()
    .withMessage("Action type is required")
    .isIn(["suspend", "activate", "verify"])
    .withMessage("Action type must be: suspend, activate, or verify"),
  body("action.reason")
    .if(body("action.type").equals("suspend"))
    .notEmpty()
    .withMessage("Reason is required for bulk suspension")
    .isString()
    .withMessage("Reason must be a string")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
    next();
  },
];

module.exports = {
  validateUserId,
  validateUpdateStatus,
  validateUpdateRoles,
  validateFilters,
  validateSearch,
  validateBulkUpdate,
};
