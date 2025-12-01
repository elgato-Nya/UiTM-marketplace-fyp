const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  WishlistValidator,
  wishlistErrorMessages,
} = require("../../../validators/wishlist/wishlist.validator");
const { userErrorMessages } = require("../../../validators");

// ================ REUSABLE VALIDATION RULE CHAINS ================

/**
 * Validate listing ID in request body
 */
const listingIdBodyValidation = (fieldName = "listingId") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(wishlistErrorMessages.listingId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.listing)
    .bail()
    .custom((listingId) => {
      if (!listingId || typeof listingId !== "string") return false;
      return /^[0-9a-fA-F]{24}$/.test(listingId);
    })
    .withMessage(wishlistErrorMessages.listingId.invalid);
};

/**
 * Validate listing ID in URL parameters
 */
const listingIdParamValidation = (paramName = "listingId") => {
  return param(paramName)
    .notEmpty()
    .withMessage(wishlistErrorMessages.listingId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.listing)
    .bail()
    .custom((listingId) => {
      if (!listingId || typeof listingId !== "string") return false;
      return /^[0-9a-fA-F]{24}$/.test(listingId);
    })
    .withMessage(wishlistErrorMessages.listingId.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate Add to Wishlist Request
 *
 * @route   POST /api/wishlist/add
 * @body    { listingId: string }
 */
const validateAddToWishlist = [
  listingIdBodyValidation("listingId"),
  handleValidationErrors,
];

/**
 * Validate Remove from Wishlist Request
 *
 * @route   DELETE /api/wishlist/item/:listingId
 * @param   listingId
 */
const validateRemoveFromWishlist = [
  listingIdParamValidation("listingId"),
  handleValidationErrors,
];

/**
 * Validate Move to Cart Request
 *
 * @route   POST /api/wishlist/move-to-cart/:listingId
 * @param   listingId
 */
const validateMoveToCart = [
  listingIdParamValidation("listingId"),
  handleValidationErrors,
];

module.exports = {
  validateAddToWishlist,
  validateRemoveFromWishlist,
  validateMoveToCart,

  // Export individual validation functions for reuse
  listingIdBodyValidation,
  listingIdParamValidation,
};
