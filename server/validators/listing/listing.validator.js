const { ListingCategory } = require("../../utils/enums/listing.enum");
const { UploadValidator } = require("../upload/upload.validator");

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
   * NOTE: Name must be a non-empty string with min length of 5, max length 100 and cannot contain / \ : * ? " < > |
   */
  static isValidListingName(name) {
    if (!name || typeof name !== "string") return false;
    const trimmed = name.trim();
    if (trimmed.length < 5 || trimmed.length > 100) return false;
    // Disallow / \ : * ? " < > |
    return /^[^\/\\:*?"<>|]+$/.test(trimmed);
  }

  /** Validates listing description
   * @param {string} description
   * @returns {boolean}
   * NOTE: Description is OPTIONAL but if provided must be a string with max length 1000
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

  /**
   * Validates array of image URLs
   * @param {Array} images
   * @returns {boolean}
   * NOTE: Uses shared UploadValidator for consistency
   * NOTE: Allows 0-10 images (empty array is valid for optional images)
   */
  static isValidImagesArray(images) {
    if (!Array.isArray(images)) return false;
    // Allow empty array (images optional) or up to 10 images
    if (images.length === 0) return true;
    if (images.length > 10) return false;
    return images.every((url) => UploadValidator.isValidImageUrl(url));
  }

  /**
   * Validates single image URL
   * @param {string} imageUrl
   * @returns {boolean}
   * NOTE: Delegates to shared UploadValidator for consistency
   */
  static isValidImageUrl(imageUrl) {
    return UploadValidator.isValidImageUrl(imageUrl);
  }
}

const listingErrorMessages = {
  boolean: "must be either true or false",
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
    invalid: {
      length: "Listing name must be between 5 and 100 characters",
      format: 'Listing name cannot contain / \\ : * ? " < > |',
    },
  },
  description: {
    invalid: "Listing description must be a string with max length 1000",
  },
  price: {
    required: "Listing price is required",
    invalid: "Listing price cannot be negative",
  },
  images: {
    invalid: {
      length: "Images must be an array with at most 10 URLs",
      format:
        "Images must be an array of valid S3 URLs, HTTPS URLs, or base64 strings. Empty array is allowed.",
    },
  },
  stock: {
    required: "Stock quantity is required",
    invalid: "Stock quantity cannot be negative",
  },
  fields: {
    invalid: "Fields parameter must be between 1 and 200 characters",
  },
  search: {
    invalid: "Search parameter must be between 1 and 100 characters",
  },
  page: {
    negative: "Page number cannot be negative",
  },
  limit: {
    invalid: {
      format: "Limit must be a number between 1 and 100",
      length: "Limit must be between 1 and 100",
    },
  },
  sort: {
    invalid: {
      format:
        'Sort must be either "price_asc", "price_desc", "newest", or "oldest"',
      length: "Sort parameter must be between 1 and 100 characters",
    },
  },
};

module.exports = { ListingValidator, listingErrorMessages };
