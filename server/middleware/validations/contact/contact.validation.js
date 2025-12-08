const { body, param, query, validationResult } = require("express-validator");
const { createValidationError } = require("../../../utils/errors");
const {
  ContactValidator,
  contactValidatorMessages,
} = require("../../../validators/contact/contact.validator");

/**
 * Contact Validation Middleware
 *
 * PURPOSE: Validate contact form submissions and admin operations
 * SCOPE: Input validation, sanitization, business rules using ContactValidator
 */

/**
 * Validate contact submission creation
 */
const validateCreateSubmission = [
  body("type")
    .custom((value) => ContactValidator.isValidSubmissionType(value))
    .withMessage(contactValidatorMessages.submissionType.invalid),

  body("name")
    .trim()
    .notEmpty()
    .withMessage(contactValidatorMessages.name.required)
    .custom((value) => ContactValidator.isValidContactName(value))
    .withMessage(contactValidatorMessages.name.invalid),

  body("email")
    .trim()
    .normalizeEmail()
    .custom((value) => ContactValidator.isValidEmail(value))
    .withMessage(contactValidatorMessages.email.invalid),

  body("phoneNumber")
    .optional()
    .trim()
    .custom((value) => !value || ContactValidator.isValidContactPhone(value))
    .withMessage(contactValidatorMessages.phoneNumber.invalid),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage(contactValidatorMessages.subject.required)
    .custom((value) => ContactValidator.isValidSubject(value))
    .withMessage(contactValidatorMessages.subject.invalid),

  body("message")
    .trim()
    .notEmpty()
    .withMessage(contactValidatorMessages.message.required)
    .custom((value) => ContactValidator.isValidMessage(value))
    .withMessage(contactValidatorMessages.message.invalid),

  // Bug-specific validations
  body("bugDetails.severity")
    .if(body("type").equals("bug"))
    .notEmpty()
    .withMessage("Bug severity is required for bug reports")
    .custom((value) => ContactValidator.isValidBugSeverity(value))
    .withMessage(contactValidatorMessages.bugSeverity.invalid),

  body("bugDetails.expectedBehavior")
    .if(body("type").equals("bug"))
    .trim()
    .notEmpty()
    .withMessage("Expected behavior is required for bug reports")
    .custom((value) => ContactValidator.isValidBugDescription(value, true))
    .withMessage(contactValidatorMessages.bugDescription.invalid),

  body("bugDetails.actualBehavior")
    .if(body("type").equals("bug"))
    .trim()
    .notEmpty()
    .withMessage("Actual behavior is required for bug reports")
    .custom((value) => ContactValidator.isValidBugDescription(value, true))
    .withMessage(contactValidatorMessages.bugDescription.invalid),

  body("bugDetails.stepsToReproduce")
    .optional()
    .trim()
    .custom(
      (value) =>
        !value || ContactValidator.isValidStepsToReproduce(value, false)
    )
    .withMessage(contactValidatorMessages.stepsToReproduce.invalid),

  body("bugDetails.browser")
    .optional()
    .trim()
    .custom((value) => !value || ContactValidator.isValidBrowser(value))
    .withMessage(contactValidatorMessages.browser.invalid),

  body("bugDetails.deviceType")
    .if(body("type").equals("bug"))
    .notEmpty()
    .withMessage("Device type is required for bug reports")
    .custom((value) => ContactValidator.isValidDeviceType(value))
    .withMessage(contactValidatorMessages.deviceType.invalid),

  // Collaboration-specific validations
  body("collaborationDetails.proposalType")
    .optional()
    .custom((value) => !value || ContactValidator.isValidProposalType(value))
    .withMessage(contactValidatorMessages.proposalType.invalid),

  body("collaborationDetails.organizationName")
    .optional()
    .trim()
    .custom(
      (value) => !value || ContactValidator.isValidOrganizationName(value)
    )
    .withMessage(contactValidatorMessages.organizationName.invalid),

  body("collaborationDetails.website")
    .optional()
    .trim()
    .custom((value) => !value || ContactValidator.isValidWebsite(value))
    .withMessage(contactValidatorMessages.website.invalid),

  // Content report-specific validations
  body("contentReport.reportedEntityType")
    .if(body("type").equals("content_report"))
    .notEmpty()
    .withMessage(contactValidatorMessages.entityType.required)
    .custom((value) => ContactValidator.isValidEntityType(value))
    .withMessage(contactValidatorMessages.entityType.invalid),

  body("contentReport.reportedEntity")
    .if(body("type").equals("content_report"))
    .notEmpty()
    .withMessage(contactValidatorMessages.entityId.required)
    .isMongoId()
    .withMessage(contactValidatorMessages.entityId.invalid),

  body("contentReport.category")
    .if(body("type").equals("content_report"))
    .notEmpty()
    .withMessage(contactValidatorMessages.reportCategory.required)
    .custom((value) => ContactValidator.isValidReportCategory(value))
    .withMessage(contactValidatorMessages.reportCategory.invalid),

  body("contentReport.evidence")
    .optional()
    .isArray()
    .withMessage("Evidence must be an array of URLs"),

  // Handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

/**
 * Validate contact ID parameter
 */
const validateContactId = [
  param("id").isMongoId().withMessage("Invalid contact ID"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError("Invalid contact ID");
    }
    next();
  },
];

/**
 * Validate status update
 */
const validateStatusUpdate = [
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "resolved", "closed", "spam"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"])
    .withMessage("Invalid priority"),

  body("assignedTo")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage("Invalid user ID for assignment"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

/**
 * Validate admin response
 */
const validateAdminResponse = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Response message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Response message must be between 10 and 2000 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

/**
 * Validate internal note
 */
const validateInternalNote = [
  body("note")
    .trim()
    .notEmpty()
    .withMessage("Note is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Note must be between 5 and 1000 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

/**
 * Validate report action
 */
const validateReportAction = [
  body("actionTaken")
    .trim()
    .notEmpty()
    .withMessage(contactValidatorMessages.reportAction.required)
    .custom((value) => ContactValidator.isValidReportAction(value))
    .withMessage(contactValidatorMessages.reportAction.invalid),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

/**
 * Validate query filters
 */
const validateContactFilters = [
  query("type")
    .optional()
    .isIn([
      "bug",
      "enquiry",
      "feedback",
      "collaboration",
      "content_report",
      "other",
    ])
    .withMessage("Invalid type filter"),

  query("status")
    .optional()
    .isIn(["pending", "in-progress", "resolved", "closed", "spam"])
    .withMessage("Invalid status filter"),

  query("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"])
    .withMessage("Invalid priority filter"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
    }
    next();
  },
];

module.exports = {
  validateCreateSubmission,
  validateContactId,
  validateStatusUpdate,
  validateAdminResponse,
  validateInternalNote,
  validateReportAction,
  validateContactFilters,
};
