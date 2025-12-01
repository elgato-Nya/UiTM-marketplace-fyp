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
