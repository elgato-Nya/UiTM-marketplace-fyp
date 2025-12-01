const { MAX_WISHLIST_ITEMS } = require("../../utils/enums/cart.enum");

class WishlistValidator {
  static isValidWishlistLimit(itemCount) {
    if (typeof itemCount !== "number" || !Number.isInteger(itemCount)) {
      return false;
    }
    return itemCount >= 0 && itemCount <= MAX_WISHLIST_ITEMS;
  }

  /**
   * Validate MongoDB ObjectId format for listing
   * @param {string} listingId
   * @returns {boolean}
   */
  static isValidListingId(listingId) {
    if (!listingId || typeof listingId !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(listingId);
  }

  /**
   * Validate wishlist has items
   * @param {Array} items
   * @returns {boolean}
   */
  static isWishlistNotEmpty(items) {
    return Array.isArray(items) && items.length > 0;
  }

  /**
   * Validate price value
   * @param {number} price
   * @returns {boolean}
   */
  static isValidPrice(price) {
    if (typeof price !== "number") return false;
    return price >= 0;
  }
}

const wishlistErrorMessages = {
  userId: {
    required: "User ID is required",
  },
  listingId: {
    required: "Listing ID is required",
    invalid: "Invalid listing ID format",
  },
  listing: {
    notFound: "Listing not found",
    unavailable: "This listing is currently unavailable",
    inCart: "Cannot add to wishlist - item is already in cart",
  },
  wishlist: {
    notFound: "Wishlist not found",
    limitReached: `Cannot add more items. Wishlist limit is ${MAX_WISHLIST_ITEMS} items`,
    empty: "Wishlist is empty",
  },
  priceWhenAdded: {
    required: "Price when added is required",
    invalid: "Price must be a non-negative number",
  },
  item: {
    alreadyExists: "Item already exists in wishlist",
    notFound: "Item not found in wishlist",
  },
  stock: {
    insufficient: "Cannot move to cart - insufficient stock",
  },
};

module.exports = { WishlistValidator, wishlistErrorMessages };
