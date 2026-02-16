const { param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  NotificationCategory,
} = require("../../../utils/enums/notification.enum");

// ================ REUSABLE VALIDATION RULE CHAINS ================

/**
 * Validate notification ID in URL parameters
 */
const notificationIdParamValidation = (paramName = "notificationId") => {
  return param(paramName)
    .notEmpty()
    .withMessage("Notification ID is required")
    .bail()
    .trim()
    .isMongoId()
    .withMessage("Invalid notification ID format");
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate GET /api/notifications query parameters
 */
const validateGetNotifications = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("category")
    .optional()
    .isIn(Object.values(NotificationCategory))
    .withMessage(
      `Category must be one of: ${Object.values(NotificationCategory).join(", ")}`
    ),
  query("read")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Read filter must be true or false"),
  query("sort")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Sort parameter too long"),
  handleValidationErrors,
];

/**
 * Validate notification ID param for single-notification operations
 */
const validateNotificationId = [
  notificationIdParamValidation(),
  handleValidationErrors,
];

module.exports = {
  validateGetNotifications,
  validateNotificationId,
};
