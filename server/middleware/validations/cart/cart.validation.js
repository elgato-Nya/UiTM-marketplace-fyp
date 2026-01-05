const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  CartValidator,
  cartErrorMessages,
} = require("../../../validators/cart/cart.validator");
const { userErrorMessages } = require("../../../validators");

const { isValidQuantity, isValidListingId, isValidVariantId } = CartValidator;

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

/**
 * Validate optional variant ID in request body
 */
const variantIdBodyValidation = (fieldName = "variantId") => {
  return body(fieldName)
    .optional({ nullable: true })
    .trim()
    .isMongoId()
    .withMessage(cartErrorMessages.variantId.invalid)
    .bail()
    .custom((variantId) => {
      return isValidVariantId(variantId);
    })
    .withMessage(cartErrorMessages.variantId.invalid);
};

/**
 * Validate variant ID in URL parameters
 */
const variantIdParamValidation = (paramName = "variantId") => {
  return param(paramName)
    .optional()
    .trim()
    .isMongoId()
    .withMessage(cartErrorMessages.variantId.invalid)
    .bail()
    .custom((variantId) => {
      return isValidVariantId(variantId);
    })
    .withMessage(cartErrorMessages.variantId.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate Add to Cart Request
 *
 * @route   POST /api/cart/add
 * @body    { listingId: string, quantity: number, variantId?: string }
 */
const validateAddToCart = [
  listingIdBodyValidation("listingId"),
  variantIdBodyValidation("variantId"),
  quantityValidation("quantity"),
  handleValidationErrors,
];

/**
 * Validate Update Cart Item Request
 *
 * @route   PATCH /api/cart/item/:listingId
 * @param   listingId
 * @query   variantId (optional)
 * @body    { quantity: number }
 */
const validateUpdateCartItem = [
  listingIdParamValidation("listingId"),
  variantIdParamValidation("variantId"),
  quantityValidation("quantity"),
  handleValidationErrors,
];

/**
 * Validate Remove from Cart Request
 *
 * @route   DELETE /api/cart/item/:listingId
 * @param   listingId
 * @query   variantId (optional)
 */
const validateRemoveFromCart = [
  listingIdParamValidation("listingId"),
  variantIdParamValidation("variantId"),
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
  variantIdBodyValidation,
  variantIdParamValidation,
};
