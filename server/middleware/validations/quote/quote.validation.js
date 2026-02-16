const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  QuotePriority,
  QuoteCancelReason,
  QuoteStatus,
} = require("../../../utils/enums/quote.enum");

// ================ REUSABLE VALIDATION CHAINS ================

const quoteIdParamValidation = () => {
  return param("id")
    .notEmpty()
    .withMessage("Quote ID is required")
    .isMongoId()
    .withMessage("Invalid quote ID format");
};

const listingIdParamValidation = () => {
  return param("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid listing ID format");
};

const listingIdBodyValidation = () => {
  return body("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid listing ID format");
};

const messageValidation = () => {
  return body("message")
    .notEmpty()
    .withMessage("Request message is required")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters");
};

const budgetValidation = () => {
  return body("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number");
};

const timelineValidation = () => {
  return body("timeline")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Timeline cannot exceed 200 characters");
};

const priorityValidation = () => {
  return body("priority")
    .optional()
    .isIn(Object.values(QuotePriority))
    .withMessage("Invalid priority level");
};

const customFieldsValidation = () => {
  return body("customFieldValues")
    .optional()
    .isArray()
    .withMessage("Custom fields must be an array");
};

const quotedPriceValidation = () => {
  return body("quotedPrice")
    .notEmpty()
    .withMessage("Quoted price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Quoted price must be greater than 0");
};

const estimatedDurationValidation = () => {
  return body("estimatedDuration")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Estimated duration cannot exceed 100 characters");
};

const sellerMessageValidation = () => {
  return body("message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message cannot exceed 1000 characters");
};

const depositValidation = () => {
  return [
    body("depositRequired")
      .optional()
      .isBoolean()
      .withMessage("Deposit required must be a boolean"),
    body("depositAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Deposit amount must be a positive number"),
    body("depositPercentage")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Deposit percentage must be between 0 and 100"),
  ];
};

const termsValidation = () => {
  return body("terms")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Terms cannot exceed 500 characters");
};

const cancelReasonValidation = () => {
  return body("reason")
    .notEmpty()
    .withMessage("Cancel reason is required")
    .isIn(Object.values(QuoteCancelReason))
    .withMessage("Invalid cancel reason");
};

const cancelNoteValidation = () => {
  return body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters");
};

const rejectReasonValidation = () => {
  return body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters");
};

const completionNoteValidation = () => {
  return body("completionNote")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Completion note cannot exceed 500 characters");
};

const statusQueryValidation = () => {
  return query("status")
    .optional()
    .isIn(Object.values(QuoteStatus))
    .withMessage("Invalid status filter");
};

const roleQueryValidation = () => {
  return query("role")
    .optional()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be buyer or seller");
};

const priorityQueryValidation = () => {
  return query("priority")
    .optional()
    .isIn(Object.values(QuotePriority))
    .withMessage("Invalid priority filter");
};

const paginationValidation = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("sort").optional().isString().withMessage("Sort must be a string"),
  ];
};

// ================ EXPORTED VALIDATION MIDDLEWARE ================

const validateCreateQuote = [
  listingIdBodyValidation(),
  messageValidation(),
  budgetValidation(),
  timelineValidation(),
  priorityValidation(),
  customFieldsValidation(),
  handleValidationErrors,
];

const validateQuoteIdParam = [quoteIdParamValidation(), handleValidationErrors];

const validateListingIdParam = [
  listingIdParamValidation(),
  handleValidationErrors,
];

const validateProvideQuote = [
  quoteIdParamValidation(),
  quotedPriceValidation(),
  estimatedDurationValidation(),
  sellerMessageValidation(),
  ...depositValidation(),
  termsValidation(),
  handleValidationErrors,
];

const validateAcceptQuote = [quoteIdParamValidation(), handleValidationErrors];

const validateRejectQuote = [
  quoteIdParamValidation(),
  rejectReasonValidation(),
  handleValidationErrors,
];

const validateCancelQuote = [
  quoteIdParamValidation(),
  cancelReasonValidation(),
  cancelNoteValidation(),
  handleValidationErrors,
];

const validateStartService = [quoteIdParamValidation(), handleValidationErrors];

const validateCompleteService = [
  quoteIdParamValidation(),
  completionNoteValidation(),
  handleValidationErrors,
];

const validateGetQuotes = [
  statusQueryValidation(),
  roleQueryValidation(),
  priorityQueryValidation(),
  ...paginationValidation(),
  handleValidationErrors,
];

const validateGetQuote = [quoteIdParamValidation(), handleValidationErrors];

module.exports = {
  validateCreateQuote,
  validateQuoteIdParam,
  validateListingIdParam,
  validateProvideQuote,
  validateAcceptQuote,
  validateRejectQuote,
  validateCancelQuote,
  validateStartService,
  validateCompleteService,
  validateGetQuotes,
  validateGetQuote,
};
