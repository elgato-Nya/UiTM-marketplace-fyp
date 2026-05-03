const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const validateOrderIdParam = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  handleValidationErrors,
];

const validateRetryOrderPaymentParam = [
  param("orderId").isMongoId().withMessage("Invalid order ID format"),
  handleValidationErrors,
];

const validateOrderPaymentStatusParam = [
  param("orderId").isMongoId().withMessage("Invalid order ID format"),
  handleValidationErrors,
];

const validateCreateOrderBill = [
  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
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

const validateCreatePlanUpgradeBill = [
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

const validateToyyibPayCallback = [
  body()
    .custom((value) => value && typeof value === "object")
    .withMessage("Callback body must be an object"),
  handleValidationErrors,
];

module.exports = {
  validateOrderIdParam,
  validateRetryOrderPaymentParam,
  validateOrderPaymentStatusParam,
  validateCreateOrderBill,
  validateCreatePlanUpgradeBill,
  validateToyyibPayCallback,
};
