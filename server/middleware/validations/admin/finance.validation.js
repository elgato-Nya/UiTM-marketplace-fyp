const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const validateWithdrawalIdParam = [
  param("id").isMongoId().withMessage("Invalid withdrawal ID"),
  handleValidationErrors,
];

const validateSellerIdParam = [
  param("id").isMongoId().withMessage("Invalid seller ID format"),
  handleValidationErrors,
];

const validateAdminWithdrawalsQuery = [
  query("status")
    .optional()
    .isIn(["pending", "completed", "rejected"])
    .withMessage("Invalid withdrawal status"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

const validateWithdrawalAction = [
  body("adminNote")
    .optional()
    .isString()
    .withMessage("Admin note must be a string"),
  handleValidationErrors,
];

const validateWalletTransactionsQuery = [
  query("type")
    .optional()
    .isIn(["credit", "debit", "fee"])
    .withMessage("Invalid transaction type"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

module.exports = {
  validateWithdrawalIdParam,
  validateSellerIdParam,
  validateAdminWithdrawalsQuery,
  validateWithdrawalAction,
  validateWalletTransactionsQuery,
};
