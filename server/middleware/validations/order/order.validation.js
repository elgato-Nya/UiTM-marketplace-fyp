const { body, param, query } = require("express-validator");
const logger = require("../../../utils/logger");
const { handleValidationErrors } = require("../validation.error");

const {
  OrderValidator,
  orderErrorMessages,
} = require("../../../validators/order/order.validator");
const {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  DeliveryMethod,
  CancelReason,
} = require("../../../utils/enums/order.enum");

const {
  isValidOrderItems,
  isValidDeliveryDetails,
  isValidTotalAmounts,
  isValidStatusTransition,
  isValidBuyerInfo,
  isValidSellerInfo,
  isValidEndDate,
} = OrderValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================

const buyerInfoValidation = (fieldName = "buyer") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.buyer.required)
    .bail()
    .isObject()
    .withMessage("Buyer information must be an object")
    .bail()
    .custom((buyer) => {
      return isValidBuyerInfo(buyer);
    })
    .withMessage(orderErrorMessages.buyer.invalid);
};

const sellerInfoValidation = (fieldName = "seller") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.seller.required)
    .bail()
    .isObject()
    .withMessage("Seller information must be an object")
    .bail()
    .custom((seller) => {
      return isValidSellerInfo(seller);
    })
    .withMessage(orderErrorMessages.seller.invalid);
};

const orderItemsValidation = (fieldName = "items") => {
  return body(fieldName)
    .isArray({ min: 1 })
    .withMessage(orderErrorMessages.items.required)
    .bail()
    .custom((items) => {
      return isValidOrderItems(items);
    })
    .withMessage(orderErrorMessages.items.invalid);
};

const totalAmountsValidation = (fieldName = "totalAmount") => {
  return body(fieldName)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(orderErrorMessages.amounts.negative);
};

const paymentValidation = () => {
  return body("paymentMethod")
    .notEmpty()
    .withMessage(orderErrorMessages.paymentMethod.required)
    .bail()
    .trim()
    .toLowerCase()
    .isIn(Object.values(PaymentMethod))
    .withMessage(orderErrorMessages.paymentMethod.invalid);
};

const orderStatusValidation = (fieldName = "status") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.status.required)
    .bail()
    .trim()
    .toLowerCase()
    .isIn(Object.values(OrderStatus))
    .withMessage(orderErrorMessages.status.invalid);
};

const deliveryMethodValidation = (fieldName = "deliveryMethod") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.deliveryMethod.required)
    .bail()
    .trim()
    .toLowerCase()
    .isIn(Object.values(DeliveryMethod))
    .withMessage(orderErrorMessages.deliveryMethod.invalid);
};

const deliveryAddressValidation = (fieldName = "deliveryAddress") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.deliveryAddress.required)
    .bail()
    .isObject()
    .withMessage("Delivery address must be an object")
    .custom((address, { req }) => {
      const deliveryMethod = req.body.deliveryMethod;
      return isValidDeliveryDetails(deliveryMethod, address);
    })
    .withMessage(orderErrorMessages.deliveryAddress.invalid);
};

const cancellationReasonValidation = (fieldName = "reason") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(orderErrorMessages.cancelReason.required)
    .bail()
    .trim()
    .toLowerCase()
    .isIn(Object.values(CancelReason))
    .withMessage(orderErrorMessages.cancelReason.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate Create Order Request
 *
 * PURPOSE: Comprehensive validation for order creation
 * VALIDATES: Items structure, delivery details, payment method, delivery address
 * PATTERN: Following your listing validation structure with custom validators
 */
const validateCreateOrder = [
  orderItemsValidation("items"),
  deliveryAddressValidation("deliveryAddress"),
  deliveryMethodValidation("deliveryMethod"),
  paymentValidation(),
  // Optional notes field
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Notes cannot exceed 250 characters"),

  handleValidationErrors,
];

/**
 * Validate Update Order Status Request
 *
 * PURPOSE: Validate status updates with transition rules
 * VALIDATES: Status values, optional notes, status transition logic
 */
const validateUpdateOrderStatus = [
  orderStatusValidation("status"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Notes cannot exceed 250 characters"),
  // Custom validation for status transitions (will be checked in service layer too)
  body("status").notEmpty().withMessage("Status is required"),

  handleValidationErrors,
];

/**
 * Validate Cancel Order Request
 *
 * PURPOSE: Validate order cancellation with proper reason
 * VALIDATES: Cancellation reason, optional description
 */
const validateCancelOrder = [
  cancellationReasonValidation("reason"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  handleValidationErrors,
];

/**
 * Validate Get Order Request
 *
 * PURPOSE: Validate query parameters for order retrieval
 * VALIDATES: Field selection, history inclusion flags
 */
const validateGetOrder = [
  query("fields")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9,._-]+$/)
    .withMessage("Invalid field selection format"),
  query("includeHistory")
    .optional()
    .isBoolean()
    .withMessage("includeHistory must be a boolean"),

  handleValidationErrors,
];

/**
 * Validate Get Orders Request (List/Search)
 *
 * PURPOSE: Comprehensive validation for order listing and filtering
 * VALIDATES: Role filters, status filters, pagination, date ranges
 */
const validateGetOrders = [
  query("role")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be either 'buyer' or 'seller'"),
  query("status")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(OrderStatus))
    .withMessage("Invalid order status"),
  query("paymentStatus")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(PaymentStatus))
    .withMessage("Invalid payment status"),
  query("deliveryStatus")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["pending", "processing", "shipped", "delivered"])
    .withMessage("Invalid delivery status"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const startDate = req.query.startDate;
        return isValidEndDate(startDate, endDate);
      }
    })
    .withMessage("End date must be after start date"),
  query("urgent")
    .optional()
    .isBoolean()
    .withMessage("Urgent filter must be a boolean"),

  query("period")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["day", "week", "month", "year"])
    .withMessage("Period must be day, week, month, or year"),

  query("sort")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9,._-]+$/)
    .withMessage("Invalid sort format"),

  query("fields")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9,._-]+$/)
    .withMessage("Invalid field selection format"),

  handleValidationErrors,
];

/**
 * Validate Order ID Parameter
 *
 * PURPOSE: Validate MongoDB ObjectId in URL parameters
 * VALIDATES: Order ID format and existence
 */
const validateOrderIdParam = [
  param("id").isMongoId().withMessage("Invalid order ID format"),

  handleValidationErrors,
];

/**
 * Validate Order Status Parameter
 *
 * PURPOSE: Validate order status in URL parameters
 * VALIDATES: Status value in route parameters
 */
const validateOrderStatusParam = [
  param("status")
    .trim()
    .toLowerCase()
    .isIn(Object.values(OrderStatus))
    .withMessage("Invalid order status in URL parameter"),

  handleValidationErrors,
];

/**
 * Validate Pagination Parameters
 *
 * PURPOSE: Validate pagination query parameters
 * VALIDATES: Page and limit values with reasonable bounds
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Page must be a positive integer between 1 and 1000"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

/**
 * Validate Get Seller Orders Request
 *
 * PURPOSE: Validate query parameters specific to seller order views
 * VALIDATES: Same as regular order listing but with seller-specific urgent filter
 */
const validateGetSellerOrders = [
  query("role")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be either 'buyer' or 'seller'"),

  query("status")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(OrderStatus))
    .withMessage("Invalid order status"),

  query("paymentStatus")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(PaymentStatus))
    .withMessage("Invalid payment status"),

  query("deliveryStatus")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["pending", "processing", "shipped", "delivered"])
    .withMessage("Invalid delivery status"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const startDate = req.query.startDate;
        return isValidEndDate(startDate, endDate);
      }
    })
    .withMessage("End date must be after start date"),

  query("urgent")
    .optional()
    .isBoolean()
    .withMessage("Urgent filter must be a boolean"),

  query("period")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["day", "week", "month", "year"])
    .withMessage("Period must be day, week, month, or year"),

  query("sort")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9,._-]+$/)
    .withMessage("Invalid sort format"),

  query("fields")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9,._-]+$/)
    .withMessage("Invalid field selection format"),

  handleValidationErrors,
];

/**
 * Validate Get Order Analytics Request
 *
 * PURPOSE: Validate query parameters for order analytics
 * VALIDATES: Period parameter for analytics timeframe
 */
const validateGetOrderAnalytics = [
  query("period")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["day", "week", "month", "year"])
    .withMessage("Period must be day, week, month, or year"),

  handleValidationErrors,
];

module.exports = {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateGetOrder,
  validateGetOrders,
  validateOrderIdParam,
  validateOrderStatusParam,
  validatePagination,

  validateGetOrderAnalytics,
  validateGetSellerOrders,

  // Export individual validation functions for reuse
  orderStatusValidation,
  cancellationReasonValidation,
  deliveryMethodValidation,
  paymentValidation,
  orderItemsValidation,
  deliveryAddressValidation,
  buyerInfoValidation,
  sellerInfoValidation,
  totalAmountsValidation,
};
