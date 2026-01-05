const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const {
  ListingCategory,
  VariantLimits,
  QuoteLimits,
  QuoteFieldType,
} = require("../../../utils/enums/listing.enum");
const {
  ListingValidator,
  listingErrorMessages,
} = require("../../../validators/listing/listing.validator");
const logger = require("../../../utils/logger");
const { userErrorMessages } = require("../../../validators");

const {
  isValidCategory,
  isValidImagesArray,
  isValidListingName,
  isValidListingPrice,
  isValidListingDescription,
  isValidListingStock,
  isValidType,
  isValidVariantName,
  isValidSku,
  isValidVariantPrice,
  isValidVariantStock,
  isValidVariantAttributes,
  isValidVariantImages,
  isValidVariantsArray,
  isValidQuoteSettings,
  isCategoryMatchingType,
} = ListingValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================

const listingTypeValidation = (fieldname = "type") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.type.required)
    .bail()
    .trim()
    .toLowerCase()
    .custom((type) => {
      return isValidType(type);
    })
    .withMessage(listingErrorMessages.type.invalid);
};

const listingNameValidation = (fieldname = "name") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.name.required)
    .bail()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage(listingErrorMessages.name.invalid.length)
    .bail()
    .custom((name) => {
      return isValidListingName(name);
    })
    .withMessage(listingErrorMessages.name.invalid.format);
};

const listingDescriptionValidation = (fieldname = "description") => {
  return body(fieldname)
    .trim()
    .isLength({ max: 1000 })
    .withMessage(listingErrorMessages.description.invalid)
    .custom((description) => {
      return isValidListingDescription(description);
    })
    .withMessage(listingErrorMessages.description.invalid);
};

const listingPriceValidation = (fieldname = "price") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.price.required)
    .bail()
    .isFloat({ min: 0 })
    .withMessage(listingErrorMessages.price.invalid)
    .bail()
    .toFloat()
    .custom((price) => {
      return isValidListingPrice(price);
    })
    .withMessage(listingErrorMessages.price.invalid);
};

const listingCategoryValidation = (fieldname = "category") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.category.required)
    .bail()
    .trim()
    .isIn(Object.values(ListingCategory))
    .withMessage(listingErrorMessages.category.invalid)
    .bail()
    .custom((category) => {
      return isValidCategory(category);
    })
    .withMessage(listingErrorMessages.category.invalid)
    .bail()
    .custom((category, { req }) => {
      const type = req.body.type;
      if (!type) return true; // Type validation will handle missing type
      return isCategoryMatchingType(category, type);
    })
    .withMessage(listingErrorMessages.category.typeMismatch);
};

const listingImagesValidation = (fieldname = "images") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.images.required)
    .isArray({ max: 10 })
    .withMessage(listingErrorMessages.images.invalid.length)
    .bail()
    .custom((images) => {
      return isValidImagesArray(images);
    })
    .withMessage(listingErrorMessages.images.invalid.format);
};

const listingStockValidation = (fieldname = "stock") => {
  return body(fieldname)
    .if((value, { req }) => {
      // Stock required for products WITHOUT variants
      const hasVariants = req.body.variants && req.body.variants.length > 0;
      return req.body.type === "product" && !hasVariants;
    })
    .notEmpty()
    .withMessage(listingErrorMessages.stock.conditionalRequired)
    .bail()
    .isInt({ min: 0 })
    .withMessage(listingErrorMessages.stock.invalid)
    .bail()
    .toInt()
    .custom((stock) => {
      return isValidListingStock(stock);
    })
    .withMessage(listingErrorMessages.stock.invalid);
};

// ================ VARIANT VALIDATION RULE CHAINS ================

const variantNameValidation = (fieldname = "name") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.variant.name.required)
    .bail()
    .trim()
    .isLength({
      min: VariantLimits.MIN_VARIANT_NAME_LENGTH,
      max: VariantLimits.MAX_VARIANT_NAME_LENGTH,
    })
    .withMessage(listingErrorMessages.variant.name.invalid)
    .bail()
    .custom((name) => isValidVariantName(name))
    .withMessage(listingErrorMessages.variant.name.invalid);
};

const variantSkuValidation = (fieldname = "sku") => {
  return body(fieldname)
    .optional({ nullable: true })
    .trim()
    .isLength({ max: VariantLimits.MAX_SKU_LENGTH })
    .withMessage(listingErrorMessages.variant.sku.invalid)
    .custom((sku) => isValidSku(sku))
    .withMessage(listingErrorMessages.variant.sku.invalid);
};

const variantPriceValidation = (fieldname = "price") => {
  return body(fieldname)
    .notEmpty()
    .withMessage(listingErrorMessages.variant.price.required)
    .bail()
    .isFloat({ min: 0 })
    .withMessage(listingErrorMessages.variant.price.invalid)
    .bail()
    .toFloat()
    .custom((price) => isValidVariantPrice(price))
    .withMessage(listingErrorMessages.variant.price.invalid);
};

const variantStockValidation = (fieldname = "stock") => {
  return body(fieldname)
    .optional()
    .isInt({ min: 0 })
    .withMessage(listingErrorMessages.variant.stock.invalid)
    .bail()
    .toInt()
    .custom((stock) => isValidVariantStock(stock))
    .withMessage(listingErrorMessages.variant.stock.invalid);
};

const variantAttributesValidation = (fieldname = "attributes") => {
  return body(fieldname)
    .optional({ nullable: true })
    .custom((attributes) => isValidVariantAttributes(attributes))
    .withMessage(listingErrorMessages.variant.attributes.invalid);
};

const variantImagesValidation = (fieldname = "images") => {
  return body(fieldname)
    .optional({ nullable: true })
    .isArray({ max: VariantLimits.MAX_VARIANT_IMAGES })
    .withMessage(listingErrorMessages.variant.images.invalid)
    .custom((images) => isValidVariantImages(images))
    .withMessage(listingErrorMessages.variant.images.invalid);
};

const variantIsAvailableValidation = (fieldname = "isAvailable") => {
  return body(fieldname)
    .optional()
    .isBoolean()
    .withMessage(listingErrorMessages.variant.isAvailable.invalid)
    .toBoolean();
};

/**
 * Validates variants array when creating/updating a listing with variants
 */
const listingVariantsValidation = (fieldname = "variants") => {
  return body(fieldname)
    .optional({ nullable: true })
    .isArray({ max: VariantLimits.MAX_VARIANTS_PER_LISTING })
    .withMessage(listingErrorMessages.variant.array.limitReached)
    .custom((variants, { req }) => {
      if (!variants || variants.length === 0) return true;

      const listingType = req.body.type || "product";

      // Check each variant and get detailed error
      for (let i = 0; i < variants.length; i++) {
        const error = ListingValidator.getVariantValidationError(
          variants[i],
          listingType,
          i
        );
        if (error) {
          throw new Error(error);
        }
      }

      return true;
    })
    .withMessage(listingErrorMessages.variant.invalid);
};

/**
 * Validates quote settings when creating/updating a listing
 */
const listingQuoteSettingsValidation = (fieldname = "quoteSettings") => {
  return body(fieldname)
    .optional({ nullable: true })
    .custom((quoteSettings, { req }) => {
      // Quote settings only valid for services
      if (quoteSettings?.enabled && req.body.type !== "service") {
        throw new Error(listingErrorMessages.quoteSettings.serviceOnly);
      }
      return isValidQuoteSettings(quoteSettings);
    })
    .withMessage(listingErrorMessages.quoteSettings.invalid);
};

/**
 * Conditional price validation - price optional if variants exist or quote-based
 */
const conditionalPriceValidation = (fieldname = "price") => {
  return body(fieldname)
    .if((value, { req }) => {
      const hasVariants = req.body.variants && req.body.variants.length > 0;
      const isQuoteBased = req.body.quoteSettings?.enabled === true;
      // Price required only if no variants and not quote-based
      return !hasVariants && !isQuoteBased;
    })
    .notEmpty()
    .withMessage(listingErrorMessages.price.conditionalRequired)
    .bail()
    .isFloat({ min: 0 })
    .withMessage(listingErrorMessages.price.invalid)
    .toFloat();
};

const paramIdValidation = (fieldName) => {
  return param(fieldName)
    .notEmpty()
    .withMessage(userErrorMessages.mongoId.required)
    .bail()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.format);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate create listing request
 * Supports both legacy mode (price/stock at listing level) and variant mode
 */
const validateCreateListing = [
  listingTypeValidation("type"),
  listingNameValidation("name"),
  listingDescriptionValidation("description"),
  conditionalPriceValidation("price"), // Conditional based on variants/quote
  listingCategoryValidation("category"),
  listingImagesValidation("images"),
  listingStockValidation("stock"), // Conditional based on variants
  listingVariantsValidation("variants"), // Optional variants array
  listingQuoteSettingsValidation("quoteSettings"), // Optional quote settings (services only)
  handleValidationErrors,
];

/**
 * Validate update listing request
 * All fields optional for partial updates
 */
const validateUpdateListing = [
  listingTypeValidation("type").optional(),
  listingNameValidation("name").optional(),
  listingDescriptionValidation("description").optional(),
  listingPriceValidation("price").optional(),
  listingCategoryValidation("category").optional(),
  listingImagesValidation("images").optional(),
  listingStockValidation("stock").optional(),
  listingVariantsValidation("variants").optional(),
  listingQuoteSettingsValidation("quoteSettings").optional(),
  handleValidationErrors,
];

/**
 * Validate single variant when adding to a listing
 */
const validateAddVariant = [
  variantNameValidation("name"),
  variantPriceValidation("price"),
  variantSkuValidation("sku"),
  variantStockValidation("stock"),
  variantAttributesValidation("attributes"),
  variantImagesValidation("images"),
  variantIsAvailableValidation("isAvailable"),
  handleValidationErrors,
];

/**
 * Validate single variant when updating
 */
const validateUpdateVariant = [
  variantNameValidation("name").optional(),
  variantPriceValidation("price").optional(),
  variantSkuValidation("sku").optional(),
  variantStockValidation("stock").optional(),
  variantAttributesValidation("attributes").optional(),
  variantImagesValidation("images").optional(),
  variantIsAvailableValidation("isAvailable").optional(),
  handleValidationErrors,
];

/**
 * Validate variant ID parameter
 */
const validateVariantIdParam = [
  paramIdValidation("id"),
  paramIdValidation("variantId"),
  handleValidationErrors,
];

const validateGetListings = [
  query("type")
    .optional()
    .trim()
    .toLowerCase()
    .custom((type) => {
      if (type) {
        return isValidType(type);
      }
    })
    .withMessage(listingErrorMessages.type.invalid),
  query("category")
    .optional()
    .trim()
    .custom((category) => {
      if (category) {
        return isValidCategory(category);
      }
    })
    .withMessage(listingErrorMessages.category.invalid),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(listingErrorMessages.price.invalid)
    .toFloat(),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(listingErrorMessages.price.invalid)
    .toFloat(),
  query("isAvailable")
    .optional()
    .isBoolean()
    .withMessage(`isAvailable ${listingErrorMessages.boolean}`)
    .toBoolean(),
  query("isFree")
    .optional()
    .isBoolean()
    .withMessage(`isFree ${listingErrorMessages.boolean}`)
    .toBoolean(),
  query("includeUnavailable")
    .optional()
    .isBoolean()
    .withMessage(`includeUnavailable ${listingErrorMessages.boolean}`)
    .toBoolean(),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(listingErrorMessages.search.invalid),
  query("fields")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(listingErrorMessages.fields.invalid),
  handleValidationErrors,
];

const validateListingIdParam = [
  paramIdValidation("id"),
  handleValidationErrors,
];

const validateGetListing = [
  paramIdValidation("id"),
  query("includeSeller")
    .optional()
    .isBoolean()
    .withMessage(`includeSeller ${listingErrorMessages.boolean}`)
    .toBoolean(),
  query("fields")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(listingErrorMessages.fields.invalid),
  handleValidationErrors,
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(listingErrorMessages.page.negative)
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(listingErrorMessages.limit.invalid.length)
    .toInt(),
  query("sort")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(listingErrorMessages.sort.invalid.length),
  handleValidationErrors,
];

const validateSellerIdParam = [
  paramIdValidation("sellerId"),
  handleValidationErrors,
];

module.exports = {
  validateCreateListing,
  validateUpdateListing,
  validateGetListings,
  validateListingIdParam,
  validateGetListing,
  validatePagination,
  validateSellerIdParam,
  // Variant-specific validations
  validateAddVariant,
  validateUpdateVariant,
  validateVariantIdParam,
};
