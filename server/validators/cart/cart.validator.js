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
   * Validate cart has items
   * @param {Array} items
   * @returns {boolean}
   */
  static isCartNotEmpty(items) {
    return Array.isArray(items) && items.length > 0;
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
