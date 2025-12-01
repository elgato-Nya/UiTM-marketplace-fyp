const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  PaymentMethod,
  DeliveryMethod,
  AddressType,
} = require("../../../utils/enums/order.enum");
const {
  CheckoutValidator,
  checkoutErrorMessages,
} = require("../../../validators/checkout/checkout.validator");
const { CartValidator } = require("../../../validators/cart/cart.validator");
const { UserValidator } = require("../../../validators/user/user.validator");

/**
 * Checkout Validation Middleware
 *
 * PURPOSE: Validate checkout-related requests
 * PATTERN: Follows your existing validation pattern with express-validator
 * SCOPE: Session creation, updates, payment operations
 */

// ================ REUSABLE VALIDATION RULE CHAINS ================

/**
 * Validate listing ID
 * NOTE: Uses CartValidator for consistency with cart validation
 */
const listingIdValidation = (fieldName = "listingId") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(checkoutErrorMessages.listingId.required)
    .bail()
    .isMongoId()
    .withMessage(checkoutErrorMessages.listingId.invalid)
    .bail()
    .custom((listingId) => {
      return CartValidator.isValidListingId(listingId);
    })
    .withMessage(checkoutErrorMessages.listingId.invalid);
};

/**
 * Validate quantity
 */
const quantityValidation = (fieldName = "quantity") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(checkoutErrorMessages.quantity.required)
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage(checkoutErrorMessages.quantity.invalid)
    .bail()
    .toInt()
    .custom((quantity) => {
      return CheckoutValidator.isValidQuantity(quantity);
    })
    .withMessage(checkoutErrorMessages.quantity.invalid);
};

/**
 * Validate session ID (MongoDB ObjectId)
 * NOTE: Uses UserValidator.isValidMongoId for consistency
 */
const sessionIdValidation = (fieldName = "sessionId") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(checkoutErrorMessages.sessionId.required)
    .bail()
    .isMongoId()
    .withMessage(checkoutErrorMessages.sessionId.invalid)
    .bail()
    .custom((sessionId) => {
      return UserValidator.isValidMongoId(sessionId);
    })
    .withMessage(checkoutErrorMessages.sessionId.invalid);
};

/**
 * Validate delivery method
 */
const deliveryMethodValidation = (fieldName = "deliveryMethod") => {
  return body(fieldName)
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(DeliveryMethod))
    .withMessage(checkoutErrorMessages.deliveryMethod.invalid)
    .bail()
    .custom((deliveryMethod) => {
      return CheckoutValidator.isValidDeliveryMethod(deliveryMethod);
    })
    .withMessage(checkoutErrorMessages.deliveryMethod.invalid);
};

/**
 * Validate payment method
 */
const paymentMethodValidation = (fieldName = "paymentMethod") => {
  return body(fieldName)
    .optional()
    .trim()
    .toLowerCase()
    .isIn(Object.values(PaymentMethod))
    .withMessage(checkoutErrorMessages.paymentMethod.invalid)
    .bail()
    .custom((paymentMethod) => {
      return CheckoutValidator.isValidPaymentMethod(paymentMethod);
    })
    .withMessage(checkoutErrorMessages.paymentMethod.invalid);
};

/**
 * Validate delivery address structure
 */
const deliveryAddressValidation = (fieldName = "deliveryAddress") => {
  return [
    body(fieldName)
      .optional()
      .isObject()
      .withMessage(checkoutErrorMessages.deliveryAddress.invalid),
    body(`${fieldName}.type`)
      .optional()
      .isIn(Object.values(AddressType))
      .withMessage(checkoutErrorMessages.deliveryAddress.invalid),
    body(`${fieldName}.recipientName`)
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage(checkoutErrorMessages.deliveryAddress.recipientNameRequired),
    body(`${fieldName}.recipientPhone`)
      .optional()
      .trim()
      .matches(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/)
      .withMessage(
        checkoutErrorMessages.deliveryAddress.recipientPhoneRequired
      ),
  ];
};

/**
 * Validate address ID (optional)
 * NOTE: Uses UserValidator.isValidMongoId for consistency
 */
const addressIdValidation = (fieldName = "addressId") => {
  return body(fieldName)
    .optional()
    .isMongoId()
    .withMessage(checkoutErrorMessages.addressId.invalid)
    .bail()
    .custom((addressId) => {
      return UserValidator.isValidMongoId(addressId);
    })
    .withMessage(checkoutErrorMessages.addressId.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate Create Direct Checkout Request
 *
 * PURPOSE: Validate direct purchase (Buy Now) checkout creation
 * VALIDATES: Listing ID and quantity
 */
const validateCreateDirectCheckout = [
  listingIdValidation("listingId"),
  quantityValidation("quantity"),
  handleValidationErrors,
];

/**
 * Validate Update Checkout Session Request
 *
 * PURPOSE: Validate session updates (delivery/payment details)
 * VALIDATES: Delivery method, address, payment method (all optional)
 * NOTE: At least one field should be provided (checked in service layer)
 */
const validateUpdateCheckoutSession = [
  deliveryMethodValidation("deliveryMethod"),
  ...deliveryAddressValidation("deliveryAddress"),
  paymentMethodValidation("paymentMethod"),
  addressIdValidation("addressId"),
  handleValidationErrors,
];

/**
 * Validate Create Payment Intent Request
 *
 * PURPOSE: Validate payment intent creation
 * VALIDATES: Session ID
 */
const validateCreatePaymentIntent = [
  sessionIdValidation("sessionId"),
  handleValidationErrors,
];

/**
 * Validate Session ID Parameter
 *
 * PURPOSE: Validate session ID in URL params
 * VALIDATES: MongoDB ObjectId format
 * NOTE: Uses UserValidator.isValidMongoId for consistency
 */
const validateSessionIdParam = [
  param("id")
    .isMongoId()
    .withMessage(checkoutErrorMessages.sessionId.invalid)
    .bail()
    .custom((sessionId) => {
      return UserValidator.isValidMongoId(sessionId);
    })
    .withMessage(checkoutErrorMessages.sessionId.invalid),
  handleValidationErrors,
];

module.exports = {
  validateCreateDirectCheckout,
  validateUpdateCheckoutSession,
  validateCreatePaymentIntent,
  validateSessionIdParam,
  // Export individual validators for reuse
  listingIdValidation,
  quantityValidation,
  sessionIdValidation,
  deliveryMethodValidation,
  paymentMethodValidation,
  deliveryAddressValidation,
  addressIdValidation,
};
