const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  CartValidator,
  cartErrorMessages,
} = require("../../../validators/cart/cart.validator");
const { userErrorMessages } = require("../../../validators");

const { isValidQuantity, isValidListingId } = CartValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================

/**
 * Validate listing ID in request body
 */
const listingIdBodyValidation = (fieldName = "listingId") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(cartErrorMessages.listingId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.listing)
    .bail()
    .custom((listingId) => {
      return isValidListingId(listingId);
    })
    .withMessage(cartErrorMessages.listingId.invalid);
};

/**
 * Validate listing ID in URL parameters
 */
const listingIdParamValidation = (paramName = "listingId") => {
  return param(paramName)
    .notEmpty()
    .withMessage(cartErrorMessages.listingId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.listing)
    .bail()
    .custom((listingId) => {
      return isValidListingId(listingId);
    })
    .withMessage(cartErrorMessages.listingId.invalid);
};

/**
 * Validate quantity in request body
 */
const quantityValidation = (fieldName = "quantity") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(cartErrorMessages.quantity.required)
    .bail()
    .isInt({ min: 1 })
    .withMessage(cartErrorMessages.quantity.invalid)
    .bail()
    .toInt()
    .custom((quantity) => {
      return isValidQuantity(quantity);
    })
    .withMessage(cartErrorMessages.quantity.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate Add to Cart Request
 *
 * @route   POST /api/cart/add
 * @body    { listingId: string, quantity: number }
 */
const validateAddToCart = [
  listingIdBodyValidation("listingId"),
  quantityValidation("quantity"),
  handleValidationErrors,
];

/**
 * Validate Update Cart Item Request
 *
 * @route   PATCH /api/cart/item/:listingId
 * @param   listingId
 * @body    { quantity: number }
 */
const validateUpdateCartItem = [
  listingIdParamValidation("listingId"),
  quantityValidation("quantity"),
  handleValidationErrors,
];

/**
 * Validate Remove from Cart Request
 *
 * @route   DELETE /api/cart/item/:listingId
 * @param   listingId
 */
const validateRemoveFromCart = [
  listingIdParamValidation("listingId"),
  handleValidationErrors,
];

/**
 * Validate Move to Wishlist Request
 *
 * @route   POST /api/cart/move-to-wishlist/:listingId
 * @param   listingId
 */
const validateMoveToWishlist = [
  listingIdParamValidation("listingId"),
  handleValidationErrors,
];

module.exports = {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateMoveToWishlist,

  // Export individual validation functions for reuse
  listingIdBodyValidation,
  listingIdParamValidation,
  quantityValidation,
};
