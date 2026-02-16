const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  PayoutValidator,
  payoutErrorMessages,
} = require("../../../validators/payout");
const {
  PayoutStatus,
  PayoutSchedule,
} = require("../../../utils/enums/payout.enum");

// -------------------------------------------
// Seller validations
// -------------------------------------------

const validateUpdatePayoutSettings = [
  body("schedule")
    .optional()
    .isIn(Object.values(PayoutSchedule))
    .withMessage(payoutErrorMessages.schedule.invalid),
  body("autoPayoutEnabled")
    .optional()
    .isBoolean()
    .withMessage("Auto payout enabled must be boolean"),
  body("minimumPayoutAmount")
    .optional()
    .isFloat({ min: 10, max: 1000 })
    .withMessage("Minimum payout amount must be between RM 10 and RM 1000"),
  handleValidationErrors,
];

const validateUpdateBankDetails = [
  body("bankName")
    .trim()
    .notEmpty()
    .withMessage(payoutErrorMessages.bankDetails.bankNameRequired)
    .isLength({ min: 2, max: 100 })
    .withMessage(payoutErrorMessages.bankDetails.bankNameLength),
  body("bankCode")
    .trim()
    .notEmpty()
    .withMessage(payoutErrorMessages.bankDetails.bankCodeRequired)
    .custom((value) => PayoutValidator.isValidMalaysianBankCode(value))
    .withMessage(payoutErrorMessages.bankDetails.bankCodeInvalid),
  body("accountNumber")
    .trim()
    .notEmpty()
    .withMessage(payoutErrorMessages.bankDetails.accountNumberRequired)
    .custom((value) => PayoutValidator.isValidAccountNumber(value))
    .withMessage(payoutErrorMessages.bankDetails.accountNumberInvalid),
  body("accountHolderName")
    .trim()
    .notEmpty()
    .withMessage(payoutErrorMessages.bankDetails.accountHolderRequired)
    .isLength({ min: 2, max: 200 })
    .withMessage(payoutErrorMessages.bankDetails.accountHolderLength),
  handleValidationErrors,
];

const validateRequestPayout = [
  body("amount")
    .optional()
    .isFloat({ min: 10 })
    .withMessage("Payout amount must be at least RM 10"),
  handleValidationErrors,
];

const validatePayoutIdParam = [
  param("id").isMongoId().withMessage(payoutErrorMessages.payoutId.invalid),
  handleValidationErrors,
];

const validateGetPayoutHistory = [
  query("status")
    .optional()
    .isIn(Object.values(PayoutStatus))
    .withMessage(payoutErrorMessages.payout.invalidStatus),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100"),
  handleValidationErrors,
];

const validateGetBalance = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100"),
  query("type")
    .optional()
    .isString()
    .withMessage("Transaction type must be a string"),
  handleValidationErrors,
];

// -------------------------------------------
// Admin validations
// -------------------------------------------

const validateSellerIdParam = [
  param("sellerId").isMongoId().withMessage("Invalid seller ID format"),
  handleValidationErrors,
];

const validateProcessPayout = [
  param("id").isMongoId().withMessage(payoutErrorMessages.payoutId.invalid),
  body("success").isBoolean().withMessage("Success must be boolean"),
  body("bankReference")
    .if(body("success").equals("true"))
    .notEmpty()
    .withMessage("Bank reference required for successful payout")
    .isObject()
    .withMessage("Bank reference must be an object"),
  body("bankReference.referenceNumber")
    .if(body("success").equals("true"))
    .optional()
    .isString()
    .withMessage("Reference number must be a string"),
  body("bankReference.transactionId")
    .if(body("success").equals("true"))
    .optional()
    .isString()
    .withMessage("Transaction ID must be a string"),
  body("failureReason")
    .if(body("success").equals("false"))
    .notEmpty()
    .withMessage("Failure reason required for failed payout"),
  body("failureMessage")
    .optional()
    .isString()
    .withMessage("Failure message must be a string"),
  handleValidationErrors,
];

module.exports = {
  validateUpdatePayoutSettings,
  validateUpdateBankDetails,
  validateRequestPayout,
  validatePayoutIdParam,
  validateGetPayoutHistory,
  validateGetBalance,
  validateSellerIdParam,
  validateProcessPayout,
};
