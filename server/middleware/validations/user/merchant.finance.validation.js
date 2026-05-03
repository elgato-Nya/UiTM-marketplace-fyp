const { body, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const validateBankAccount = [
  body("bankName").trim().notEmpty().withMessage("Bank name is required"),
  body("accountNumber")
    .trim()
    .notEmpty()
    .withMessage("Account number is required"),
  body("accountHolderName")
    .trim()
    .notEmpty()
    .withMessage("Account holder name is required"),
  handleValidationErrors,
];

const validateWithdrawalRequest = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Withdrawal amount must be greater than zero"),
  body("bankAccountId").isMongoId().withMessage("Invalid bank account ID"),
  handleValidationErrors,
];

const validateWalletPagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("type")
    .optional()
    .isIn(["credit", "debit", "fee"])
    .withMessage("Invalid transaction type"),
  handleValidationErrors,
];

const validatePlanUpgrade = [
  body("amount")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Amount must be valid"),
  body("planType").optional().isIn(["pro"]).withMessage("Invalid plan type"),
  body("returnUrl")
    .optional()
    .isURL({ require_protocol: true })
    .withMessage("Return URL must be valid"),
  body("callbackUrl")
    .optional()
    .isURL({ require_protocol: true })
    .withMessage("Callback URL must be valid"),
  handleValidationErrors,
];

const validateFeaturedListing = [
  body("listingId").isMongoId().withMessage("Invalid listing ID"),
  handleValidationErrors,
];

module.exports = {
  validateBankAccount,
  validateWithdrawalRequest,
  validateWalletPagination,
  validatePlanUpgrade,
  validateFeaturedListing,
};
