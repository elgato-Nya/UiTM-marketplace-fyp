// Must match server enums exactly
export const LISTING_TYPES = {
  PRODUCT: { value: "product", label: "Product" },
  SERVICE: { value: "service", label: "Service" },
};

export const LISTING_CATEGORIES = {
  // Product categories (match server enum values exactly)
  PRODUCT: [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "food", label: "Food & Beverages" },
    { value: "books", label: "Books & Stationery" },
    { value: "other", label: "Other Products" },
  ],

  // Service categories (match server enum values exactly)
  SERVICE: [
    { value: "printing", label: "Printing Services" },
    { value: "repair", label: "Repair Services" },
    { value: "e-hailing", label: "E-Hailing & Transport" },
    { value: "delivery", label: "Delivery Services" },
    { value: "other-service", label: "Other Services" },
  ],
};

// Category labels map for easy lookup
export const CATEGORY_LABELS = {
  electronics: "Electronics",
  clothing: "Clothing & Fashion",
  food: "Food & Beverages",
  books: "Books & Stationery",
  other: "Other Products",
  printing: "Printing Services",
  repair: "Repair Services",
  "e-hailing": "E-Hailing & Transport",
  delivery: "Delivery Services",
  "other-service": "Other Services",
};

// Sort options for listings
export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First", shortLabel: "Newest" },
  { value: "createdAt", label: "Oldest First", shortLabel: "Oldest" },
  { value: "price", label: "Price: Low to High", shortLabel: "Price ↑" },
  { value: "-price", label: "Price: High to Low", shortLabel: "Price ↓" },
  { value: "name", label: "Name: A to Z", shortLabel: "Name A-Z" },
  { value: "-name", label: "Name: Z to A", shortLabel: "Name Z-A" },
];

export const LISTING_STATUS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "REMOVED", label: "Removed" },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 24;
export const PAGE_SIZE_OPTIONS = [12, 24, 36];

// Image Upload
export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Validation
export const VALIDATION_RULES = {
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  MIN_PRICE: 0,
  MIN_STOCK: 0,
};

// ========== VARIANT SYSTEM CONSTANTS ==========

/**
 * Variant Limits - Must match server enums exactly
 *
 * Use Cases for Variant Builder:
 * - Clothing: Size (XS, S, M, L, XL) × Color (Red, Blue, Black) = 15 variants
 * - Electronics: Storage (64GB, 128GB, 256GB) × Color (Space Gray, Silver) = 6 variants
 * - Food: Size (Small, Medium, Large) × Flavor (Original, Spicy, BBQ) = 9 variants
 * - Custom products: Any combination of attributes the seller defines
 *
 * The variant builder auto-generates all combinations from variation types,
 * saving merchants from manually creating each variant individually.
 */
export const VARIANT_LIMITS = {
  MAX_VARIANTS_PER_LISTING: 20, // Supports common product combinations
  MAX_VARIANT_NAME_LENGTH: 100,
  MIN_VARIANT_NAME_LENGTH: 1,
  MAX_SKU_LENGTH: 50,
  MAX_ATTRIBUTE_KEYS: 10,
  MAX_ATTRIBUTE_KEY_LENGTH: 50,
  MAX_ATTRIBUTE_VALUE_LENGTH: 100,
  MAX_VARIANT_IMAGES: 5,
};

/**
 * Quote Limits - Must match server enums exactly
 */
export const QUOTE_LIMITS = {
  MAX_CUSTOM_FIELDS: 10,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_FIELD_OPTIONS: 20,
  MIN_DEPOSIT_PERCENTAGE: 0,
  MAX_DEPOSIT_PERCENTAGE: 100,
  DEFAULT_RESPONSE_TIME: 24,
};

/**
 * Quote Field Types - Must match server enums exactly
 */
export const QUOTE_FIELD_TYPES = {
  TEXT: { value: "text", label: "Text Input" },
  NUMBER: { value: "number", label: "Number Input" },
  SELECT: { value: "select", label: "Dropdown Select" },
  DATE: { value: "date", label: "Date Picker" },
  TEXTAREA: { value: "textarea", label: "Text Area" },
};

/**
 * Variant validation rules
 */
export const VARIANT_VALIDATION = {
  NAME_MIN: VARIANT_LIMITS.MIN_VARIANT_NAME_LENGTH,
  NAME_MAX: VARIANT_LIMITS.MAX_VARIANT_NAME_LENGTH,
  SKU_MAX: VARIANT_LIMITS.MAX_SKU_LENGTH,
  PRICE_MIN: 0,
  STOCK_MIN: 0,
};
