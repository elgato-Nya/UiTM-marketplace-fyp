const { CartLimits } = require("../../utils/enums/cart.enum");

class CartValidator {
  static isValidQuantity(quantity) {
    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return false;
    }
    return quantity > 0 && quantity <= CartLimits.MAX_QUANTITY_PER_ITEM;
  }

  static isValidCartItemCount(itemCount) {
    if (typeof itemCount !== "number" || !Number.isInteger(itemCount)) {
      return false;
    }
    return itemCount >= 0 && itemCount <= CartLimits.MAX_ITEMS;
  }

  static isValidListingId(listingId) {
    if (!listingId || typeof listingId !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(listingId);
  }

  /**
   * Validate variant ID format (optional field)
   * @param {string|null} variantId
   * @returns {boolean}
   */
  static isValidVariantId(variantId) {
    // null/undefined is valid (no variant selected)
    if (variantId == null) return true;
    if (typeof variantId !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(variantId);
  }

  /**
   * Validate quantity doesn't exceed available stock
   * @param {number} quantity
   * @param {number} availableStock
   * @returns {boolean}
   */
  static isQuantityAvailable(quantity, availableStock) {
    if (
      typeof quantity !== "number" ||
      typeof availableStock !== "number" ||
      !Number.isInteger(quantity) ||
      !Number.isInteger(availableStock)
    ) {
      return false;
    }
    return quantity <= availableStock && availableStock >= 0;
  }

  /**
   * Validate listing is available for purchase
   * @param {Object} listing
   * @returns {boolean}
   */
  static isListingAvailable(listing) {
    if (!listing || typeof listing !== "object") return false;
    return listing.isAvailable === true;
  }

  /**
   * Validate variant is available for purchase
   * @param {Object} variant
   * @returns {boolean}
   */
  static isVariantAvailable(variant) {
    if (!variant || typeof variant !== "object") return false;
    return variant.isAvailable === true;
  }

  /**
   * Validate cart has items
   * @param {Array} items
   * @returns {boolean}
   */
  static isCartNotEmpty(items) {
    return Array.isArray(items) && items.length > 0;
  }

  /**
   * Validate that a listing with variants requires variantId
   * @param {Object} listing - The listing object
   * @param {string|null} variantId - The variant ID provided
   * @returns {{ valid: boolean, message?: string }}
   */
  static validateVariantRequirement(listing, variantId) {
    if (!listing || typeof listing !== "object") {
      return { valid: false, message: "Invalid listing" };
    }

    const hasVariants =
      Array.isArray(listing.variants) && listing.variants.length > 0;

    // If listing has variants, variantId is required
    if (hasVariants && !variantId) {
      return {
        valid: false,
        message: "This listing has variants. Please select a variant.",
      };
    }

    // If listing doesn't have variants, variantId should not be provided
    if (!hasVariants && variantId) {
      return {
        valid: false,
        message: "This listing does not have variants.",
      };
    }

    return { valid: true };
  }
}

const cartErrorMessages = {
  userId: {
    required: "User ID is required",
  },
  quantity: {
    required: "Quantity is required",
    invalid: `Quantity must be a positive integer between 1 and ${CartLimits.MAX_QUANTITY_PER_ITEM}`,
    exceedsStock: "Quantity exceeds available stock",
  },
  listingId: {
    required: "Listing ID is required",
    invalid: "Invalid listing ID format",
  },
  variantId: {
    invalid: "Invalid variant ID format",
    required: "This listing has variants. Please select a variant.",
    notAllowed: "This listing does not have variants.",
    notFound: "Variant not found in listing",
    unavailable: "This variant is currently unavailable",
  },
  cart: {
    notFound: "Cart not found",
    limitReached: `Cannot add more items. Cart limit is ${CartLimits.MAX_ITEMS} items`,
    empty: "Cart is empty",
  },
  item: {
    notFound: "Item not found in cart",
    alreadyExists: "Item already exists in cart",
    unavailable: "This item is no longer available",
  },
  listing: {
    notFound: "Listing not found",
    unavailable: "This listing is currently unavailable",
  },
  stock: {
    insufficient: "Insufficient stock available",
    exceedsAvailable: "Requested quantity exceeds available stock",
  },
};

module.exports = { CartValidator, cartErrorMessages };
