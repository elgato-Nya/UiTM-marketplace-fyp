const {
  ListingCategory,
  ListingType,
  VariantLimits,
  QuoteLimits,
  QuoteFieldType,
} = require("../../utils/enums/listing.enum");
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

  /**
   * Validates that category matches the listing type
   * @param {string} category - The category value
   * @param {string} type - The listing type ("product" or "service")
   * @returns {boolean}
   * NOTE: Product categories and service categories must match their respective type
   */
  static isCategoryMatchingType(category, type) {
    if (!category || !type) return false;

    // Map of categories to their listing types
    const productCategories = [
      ListingCategory.ELECTRONICS,
      ListingCategory.CLOTHING,
      ListingCategory.BOOKS,
      ListingCategory.FOOD,
      ListingCategory.OTHER_PRODUCT,
    ];
    const serviceCategories = [
      ListingCategory.PRINTING,
      ListingCategory.REPAIR,
      ListingCategory.E_HAILING,
      ListingCategory.DELIVERY,
      ListingCategory.OTHER_SERVICE,
    ];

    if (type === ListingType.PRODUCT) {
      return productCategories.includes(category);
    }
    if (type === ListingType.SERVICE) {
      return serviceCategories.includes(category);
    }

    return false;
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

  // ==================== VARIANT VALIDATION METHODS ====================

  /**
   * Validates variant name
   * @param {string} name
   * @returns {boolean}
   * NOTE: Name must be non-empty string between 1-100 chars (e.g., "Red - Large", "5-Session Package")
   */
  static isValidVariantName(name) {
    if (!name || typeof name !== "string") return false;
    const trimmed = name.trim();
    return (
      trimmed.length >= VariantLimits.MIN_VARIANT_NAME_LENGTH &&
      trimmed.length <= VariantLimits.MAX_VARIANT_NAME_LENGTH
    );
  }

  /**
   * Validates variant SKU
   * @param {string} sku
   * @returns {boolean}
   * NOTE: SKU is optional, but if provided must be alphanumeric with dashes/underscores, max 50 chars
   */
  static isValidSku(sku) {
    if (sku === null || sku === undefined || sku === "") return true; // Optional field
    if (typeof sku !== "string") return false;
    const trimmed = sku.trim();
    if (trimmed.length === 0 || trimmed.length > VariantLimits.MAX_SKU_LENGTH)
      return false;
    // Allow alphanumeric, dashes, and underscores
    return /^[a-zA-Z0-9\-_]+$/.test(trimmed);
  }

  /**
   * Validates variant price
   * @param {number} price
   * @returns {boolean}
   * NOTE: Price must be a finite number >= 0 (reuses listing price validation logic)
   */
  static isValidVariantPrice(price) {
    if (typeof price !== "number" || isNaN(price) || !isFinite(price))
      return false;
    return price >= 0;
  }

  /**
   * Validates variant stock
   * @param {number} stock
   * @returns {boolean}
   * NOTE: Stock must be an integer >= 0 (reuses listing stock validation logic)
   */
  static isValidVariantStock(stock) {
    if (typeof stock !== "number" || isNaN(stock)) return false;
    return stock >= 0 && Number.isInteger(stock);
  }

  /**
   * Validates variant attributes object
   * @param {Object} attributes
   * @returns {boolean}
   * NOTE: Attributes are optional key-value pairs (e.g., { color: "Red", size: "Large" })
   */
  static isValidVariantAttributes(attributes) {
    if (attributes === null || attributes === undefined) return true; // Optional
    if (typeof attributes !== "object" || Array.isArray(attributes))
      return false;

    const keys = Object.keys(attributes);
    if (keys.length > VariantLimits.MAX_ATTRIBUTES_PER_VARIANT) return false;

    for (const key of keys) {
      // Validate key length
      if (
        typeof key !== "string" ||
        key.length === 0 ||
        key.length > VariantLimits.MAX_ATTRIBUTE_KEY_LENGTH
      ) {
        return false;
      }

      const value = attributes[key];
      // Value can be string or number
      if (typeof value === "string") {
        if (value.length > VariantLimits.MAX_ATTRIBUTE_VALUE_LENGTH)
          return false;
      } else if (typeof value !== "number") {
        return false; // Only string or number allowed
      }
    }

    return true;
  }

  /**
   * Validates variant images array
   * @param {Array} images
   * @returns {boolean}
   * NOTE: Variant-specific images, max 5 per variant
   */
  static isValidVariantImages(images) {
    if (images === null || images === undefined) return true; // Optional
    if (!Array.isArray(images)) return false;
    if (images.length > VariantLimits.MAX_VARIANT_IMAGES) return false;
    return images.every((url) => UploadValidator.isValidImageUrl(url));
  }

  /**
   * Validates a single variant object
   * @param {Object} variant
   * @param {string} listingType - "product" or "service"
   * @returns {boolean}
   */
  static isValidVariant(variant, listingType = "product") {
    if (!variant || typeof variant !== "object" || Array.isArray(variant))
      return false;

    // Required fields
    if (!this.isValidVariantName(variant.name)) return false;
    if (!this.isValidVariantPrice(variant.price)) return false;

    // Stock required for products only
    if (listingType === "product") {
      if (variant.stock === undefined || variant.stock === null) return false;
      if (!this.isValidVariantStock(variant.stock)) return false;
    }

    // Optional fields
    if (!this.isValidSku(variant.sku)) return false;
    if (!this.isValidVariantAttributes(variant.attributes)) return false;
    if (!this.isValidVariantImages(variant.images)) return false;

    // isAvailable must be boolean if provided
    if (
      variant.isAvailable !== undefined &&
      typeof variant.isAvailable !== "boolean"
    ) {
      return false;
    }

    return true;
  }

  /**
   * Validates a single variant and returns detailed error message
   * @param {Object} variant
   * @param {string} listingType - "product" or "service"
   * @param {number} index - Variant index for error message
   * @returns {string|null} Error message or null if valid
   */
  static getVariantValidationError(
    variant,
    listingType = "product",
    index = 0
  ) {
    if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
      return `Variant ${index + 1}: Invalid variant format`;
    }

    // Check required fields
    if (
      !variant.name ||
      typeof variant.name !== "string" ||
      !variant.name.trim()
    ) {
      return `Variant ${index + 1}: Name is required`;
    }

    if (!this.isValidVariantName(variant.name)) {
      return `Variant ${index + 1}: Name must be between ${
        VariantLimits.MIN_VARIANT_NAME_LENGTH
      } and ${VariantLimits.MAX_VARIANT_NAME_LENGTH} characters`;
    }

    if (variant.price === undefined || variant.price === null) {
      return `Variant ${index + 1} ("${variant.name}"): Price is required`;
    }

    if (!this.isValidVariantPrice(variant.price)) {
      return `Variant ${index + 1} ("${
        variant.name
      }"): Price must be a number ≥ 0`;
    }

    // Stock validation for products
    if (listingType === "product") {
      if (variant.stock === undefined || variant.stock === null) {
        return `Variant ${index + 1} ("${
          variant.name
        }"): Stock is required for products`;
      }
      if (!this.isValidVariantStock(variant.stock)) {
        return `Variant ${index + 1} ("${
          variant.name
        }"): Stock must be a whole number ≥ 0`;
      }
    }

    // Optional field validation
    if (variant.sku && !this.isValidSku(variant.sku)) {
      return `Variant ${index + 1} ("${
        variant.name
      }"): SKU must be alphanumeric (max ${
        VariantLimits.MAX_SKU_LENGTH
      } characters)`;
    }

    if (
      variant.attributes &&
      !this.isValidVariantAttributes(variant.attributes)
    ) {
      return `Variant ${index + 1} ("${
        variant.name
      }"): Invalid attributes format`;
    }

    if (variant.images && !this.isValidVariantImages(variant.images)) {
      return `Variant ${index + 1} ("${variant.name}"): Maximum ${
        VariantLimits.MAX_VARIANT_IMAGES
      } images allowed`;
    }

    if (
      variant.isAvailable !== undefined &&
      typeof variant.isAvailable !== "boolean"
    ) {
      return `Variant ${index + 1} ("${
        variant.name
      }"): isAvailable must be true or false`;
    }

    return null; // No errors
  }

  /**
   * Validates variants array
   * @param {Array} variants
   * @param {string} listingType - "product" or "service"
   * @returns {boolean}
   * NOTE: Variants are optional, but if provided must be valid array with max 100 items
   */
  static isValidVariantsArray(variants, listingType = "product") {
    if (variants === null || variants === undefined) return true; // Optional
    if (!Array.isArray(variants)) return false;
    if (variants.length > VariantLimits.MAX_VARIANTS_PER_LISTING) return false;
    return variants.every((v) => this.isValidVariant(v, listingType));
  }

  /**
   * Validates variant count
   * @param {number} count
   * @returns {boolean}
   */
  static isValidVariantCount(count) {
    if (typeof count !== "number" || !Number.isInteger(count)) return false;
    return count >= 0 && count <= VariantLimits.MAX_VARIANTS_PER_LISTING;
  }

  // ==================== QUOTE SETTINGS VALIDATION METHODS ====================

  /**
   * Validates quote custom field
   * @param {Object} field
   * @returns {boolean}
   */
  static isValidQuoteCustomField(field) {
    if (!field || typeof field !== "object" || Array.isArray(field))
      return false;

    // Label is required
    if (
      !field.label ||
      typeof field.label !== "string" ||
      field.label.trim().length === 0 ||
      field.label.length > QuoteLimits.MAX_FIELD_LABEL_LENGTH
    ) {
      return false;
    }

    // Type is required and must be valid
    if (!field.type || !Object.values(QuoteFieldType).includes(field.type)) {
      return false;
    }

    // Required must be boolean if provided
    if (field.required !== undefined && typeof field.required !== "boolean") {
      return false;
    }

    // Options validation (for select type)
    if (field.type === QuoteFieldType.SELECT) {
      if (!Array.isArray(field.options) || field.options.length === 0) {
        return false;
      }
      if (field.options.length > QuoteLimits.MAX_FIELD_OPTIONS) return false;
      for (const opt of field.options) {
        if (
          typeof opt !== "string" ||
          opt.length === 0 ||
          opt.length > QuoteLimits.MAX_OPTION_LENGTH
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validates quote settings object
   * @param {Object} quoteSettings
   * @returns {boolean}
   * NOTE: Quote settings are optional, but if provided must follow structure
   */
  static isValidQuoteSettings(quoteSettings) {
    if (quoteSettings === null || quoteSettings === undefined) return true; // Optional
    if (typeof quoteSettings !== "object" || Array.isArray(quoteSettings))
      return false;

    // enabled must be boolean if provided
    if (
      quoteSettings.enabled !== undefined &&
      typeof quoteSettings.enabled !== "boolean"
    ) {
      return false;
    }

    // autoAccept must be boolean if provided
    if (
      quoteSettings.autoAccept !== undefined &&
      typeof quoteSettings.autoAccept !== "boolean"
    ) {
      return false;
    }

    // minPrice validation
    if (quoteSettings.minPrice !== undefined) {
      if (
        typeof quoteSettings.minPrice !== "number" ||
        quoteSettings.minPrice < 0
      ) {
        return false;
      }
    }

    // maxPrice validation
    if (quoteSettings.maxPrice !== undefined) {
      if (
        typeof quoteSettings.maxPrice !== "number" ||
        quoteSettings.maxPrice < 0
      ) {
        return false;
      }
      // maxPrice must be >= minPrice if both provided
      if (
        quoteSettings.minPrice !== undefined &&
        quoteSettings.maxPrice < quoteSettings.minPrice
      ) {
        return false;
      }
    }

    // responseTime validation
    if (quoteSettings.responseTime !== undefined) {
      if (
        typeof quoteSettings.responseTime !== "string" ||
        quoteSettings.responseTime.length > QuoteLimits.MAX_RESPONSE_TIME_LENGTH
      ) {
        return false;
      }
    }

    // requiresDeposit must be boolean if provided
    if (
      quoteSettings.requiresDeposit !== undefined &&
      typeof quoteSettings.requiresDeposit !== "boolean"
    ) {
      return false;
    }

    // depositPercentage validation
    if (quoteSettings.depositPercentage !== undefined) {
      if (
        typeof quoteSettings.depositPercentage !== "number" ||
        quoteSettings.depositPercentage < QuoteLimits.MIN_DEPOSIT_PERCENTAGE ||
        quoteSettings.depositPercentage > QuoteLimits.MAX_DEPOSIT_PERCENTAGE
      ) {
        return false;
      }
    }

    // customFields validation
    if (quoteSettings.customFields !== undefined) {
      if (!Array.isArray(quoteSettings.customFields)) return false;
      if (quoteSettings.customFields.length > QuoteLimits.MAX_CUSTOM_FIELDS)
        return false;
      for (const field of quoteSettings.customFields) {
        if (!this.isValidQuoteCustomField(field)) return false;
      }
    }

    return true;
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
    typeMismatch:
      "Category does not match listing type. Product categories: electronics, clothing, books, food, other. Service categories: printing, repair, e-hailing, delivery, other-service",
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
    conditionalRequired:
      "Price is required when listing has no variants and quote system is not enabled",
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
    conditionalRequired: "Stock is required for products without variants",
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
  // Variant error messages
  variant: {
    name: {
      required: "Variant name is required",
      invalid: `Variant name must be between ${VariantLimits.MIN_VARIANT_NAME_LENGTH} and ${VariantLimits.MAX_VARIANT_NAME_LENGTH} characters`,
    },
    sku: {
      invalid: `SKU must be alphanumeric (with dashes/underscores) and max ${VariantLimits.MAX_SKU_LENGTH} characters`,
      duplicate: "SKU must be unique within seller's listings",
    },
    price: {
      required: "Variant price is required",
      invalid: "Variant price must be a number >= 0",
    },
    stock: {
      required: "Variant stock is required for products",
      invalid: "Variant stock must be a non-negative integer",
    },
    attributes: {
      invalid: `Attributes must be an object with max ${VariantLimits.MAX_ATTRIBUTES_PER_VARIANT} key-value pairs`,
      keyLength: `Attribute key must be max ${VariantLimits.MAX_ATTRIBUTE_KEY_LENGTH} characters`,
      valueLength: `Attribute value must be max ${VariantLimits.MAX_ATTRIBUTE_VALUE_LENGTH} characters`,
      valueType: "Attribute value must be a string or number",
    },
    images: {
      invalid: `Variant images must be an array with max ${VariantLimits.MAX_VARIANT_IMAGES} URLs`,
    },
    isAvailable: {
      invalid: "isAvailable must be a boolean",
    },
    array: {
      invalid: "Variants must be an array",
      limitReached: `Maximum ${VariantLimits.MAX_VARIANTS_PER_LISTING} variants allowed per listing`,
    },
    notFound: "Variant not found",
    invalid:
      "Invalid variant data. Each variant requires: name, price. Products also require stock (integer >= 0).",
  },
  // Quote settings error messages
  quoteSettings: {
    invalid: "Quote settings must be a valid object",
    enabled: {
      invalid: "enabled must be a boolean",
    },
    autoAccept: {
      invalid: "autoAccept must be a boolean",
    },
    minPrice: {
      invalid: "minPrice must be a non-negative number",
    },
    maxPrice: {
      invalid: "maxPrice must be a non-negative number",
      lessThanMin: "maxPrice must be greater than or equal to minPrice",
    },
    responseTime: {
      invalid: `responseTime must be a string with max ${QuoteLimits.MAX_RESPONSE_TIME_LENGTH} characters`,
    },
    requiresDeposit: {
      invalid: "requiresDeposit must be a boolean",
    },
    depositPercentage: {
      invalid: `depositPercentage must be between ${QuoteLimits.MIN_DEPOSIT_PERCENTAGE} and ${QuoteLimits.MAX_DEPOSIT_PERCENTAGE}`,
    },
    customFields: {
      invalid: "customFields must be an array",
      limitReached: `Maximum ${QuoteLimits.MAX_CUSTOM_FIELDS} custom fields allowed`,
      field: {
        invalid: "Custom field must be a valid object",
        label: {
          required: "Custom field label is required",
          invalid: `Label must be max ${QuoteLimits.MAX_FIELD_LABEL_LENGTH} characters`,
        },
        type: {
          required: "Custom field type is required",
          invalid: `Field type must be one of: ${Object.values(
            QuoteFieldType
          ).join(", ")}`,
        },
        required: {
          invalid: "required must be a boolean",
        },
        options: {
          required: "Options are required for select type fields",
          invalid: `Options must be an array with max ${QuoteLimits.MAX_FIELD_OPTIONS} items`,
          itemInvalid: `Each option must be a string with max ${QuoteLimits.MAX_OPTION_LENGTH} characters`,
        },
      },
    },
    serviceOnly: "Quote settings are only available for service listings",
  },
};

module.exports = { ListingValidator, listingErrorMessages };
