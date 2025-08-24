const { ListingCategory } = require("../../enums/listing.enum");

/**
 * Pure validation functions for listing-related data
 */
class ListingValidator {
  /** Validate listing type
   *  @param {string} type
   *  @returns {boolean}
   *  NOTE: Type must be either "product" or "service"
   */
  static isValidType(type) {
    if (!type || typeof type !== "string") return false;
    return ["product", "service"].includes(type);
  }

  /** Validates listing category
   *  @param {string} category
   *  @returns {boolean}
   *  NOTE: Catergory must be one of the predefined categories in ListingCategory enum
   */
  static isValidCategory(category) {
    if (!category || typeof category !== "string") return false;

    if (Object.keys(ListingCategory).includes(category)) {
      return true; // Already a valid stored enum key
    }

    // Validate display values (for new input)
    return Object.values(ListingCategory).includes(category);
  }

  /** Validates listing name
   * @param {string} name
   * @returns {boolean}
   * NOTE: Name must be a non-empty string with max length 100 and cannot contain / \ : * ? " < > |
   */
  static isValidListigName(name) {
    if (!name || typeof name !== "string") return false;
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return false;
    // Disallow / \ : * ? " < > |
    return /^[^\/\\:*?"<>|]+$/.test(trimmed);
  }

  /** Validates listing description
   * @param {string} description
   * @returns {boolean}
   * NOTE: Description is optional but if provided must be a string with max length 1000
   */
  static isValidListingDescription(description) {
    if (!description) return true; // Description is optional
    if (typeof description !== "string") return false;
    return description.length <= 1000;
  }

  /** Validates listing price
   * @param {number} price
   * @returns {boolean}
   * NOTE: Price must be a number >= 0
   */
  static isValidListingPrice(price) {
    if (typeof price !== "number") return false;
    return price >= 0;
  }

  /** Validates stock quantity
   * @param {number} stock
   * @returns {boolean}
   * NOTE: Stock must be an integer >= 0
   */
  static isValidListingStock(stock) {
    if (typeof stock !== "number") return false;
    return stock >= 0 && Number.isInteger(stock);
  }

  /** Validates image URL
   * @param {string} imageUrl
   * @returns {boolean}
   * NOTE: Image URL must be a valid URL (starting with http/https) or a valid base64 image string (e.g., data:image/png;base64,...)
   */
  static isValidImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return false;

    // Allow URLs or base64 images
    const urlPattern = /^https?:\/\/.+/;
    const base64Pattern = /^data:image\/(jpeg|jpg|png|gif);base64,/;

    return urlPattern.test(imageUrl) || base64Pattern.test(imageUrl);
  }
}

const listingErrorMessages = () => ({
  type: {
    required: "Listing type is required",
    invalid: 'Listing type must be either "product" or "service"',
  },
  category: {
    required: "Listing category is required",
    invalid: "Listing category is invalid",
  },
  name: {
    required: "Listing name is required",
    invalid:
      'Listing name must be a non-empty string (max 100 chars) and cannot contain / \\ : * ? " < > |',
  },
  description: {
    invalid: "Listing description must be a string with max length 1000",
  },
  price: {
    required: "Listing price is required",
    invalid: "Listing price must be a number >= 0",
  },
  stock: {
    required: "Stock quantity is required",
    invalid: "Stock quantity must be an integer >= 0",
  },
  imageUrl: {
    invalid:
      "Image URL must be a valid URL (starting with http/https) or a valid base64 image string",
  },
});

module.exports = { ListingValidator, listingErrorMessages };
