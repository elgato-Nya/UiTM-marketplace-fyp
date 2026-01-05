const ListingCategory = Object.freeze({
  // Product Categories
  ELECTRONICS: "electronics",
  CLOTHING: "clothing",
  BOOKS: "books",
  FOOD: "food",
  OTHER_PRODUCT: "other",
  // Service Categories
  PRINTING: "printing",
  REPAIR: "repair",
  E_HAILING: "e-hailing",
  DELIVERY: "delivery",
  OTHER_SERVICE: "other-service",
});

/**
 * Listing Type Enum
 * PURPOSE: Centralize listing type values for consistent validation
 */
const ListingType = Object.freeze({
  PRODUCT: "product",
  SERVICE: "service",
});

/**
 * Variant Limits
 * PURPOSE: Define constraints for variant-related operations (similar to CartLimits)
 */
const VariantLimits = Object.freeze({
  MAX_VARIANTS_PER_LISTING: 100,
  MAX_VARIANT_NAME_LENGTH: 100,
  MIN_VARIANT_NAME_LENGTH: 1,
  MAX_SKU_LENGTH: 50,
  MAX_ATTRIBUTES_PER_VARIANT: 10,
  MAX_ATTRIBUTE_KEY_LENGTH: 30,
  MAX_ATTRIBUTE_VALUE_LENGTH: 100,
  MAX_VARIANT_IMAGES: 5,
});

/**
 * Quote Settings Limits
 * PURPOSE: Define constraints for quote system (services only)
 */
const QuoteLimits = Object.freeze({
  MAX_CUSTOM_FIELDS: 10,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_FIELD_OPTIONS: 20,
  MAX_OPTION_LENGTH: 100,
  MAX_RESPONSE_TIME_LENGTH: 100,
  MIN_DEPOSIT_PERCENTAGE: 0,
  MAX_DEPOSIT_PERCENTAGE: 100,
  DEFAULT_QUOTE_EXPIRY_DAYS: 7,
});

/**
 * Quote Custom Field Types
 * PURPOSE: Define allowed field types for quote custom fields
 */
const QuoteFieldType = Object.freeze({
  TEXT: "text",
  DATE: "date",
  NUMBER: "number",
  SELECT: "select",
  TEXTAREA: "textarea",
});

module.exports = {
  ListingCategory,
  ListingType,
  VariantLimits,
  QuoteLimits,
  QuoteFieldType,
};
