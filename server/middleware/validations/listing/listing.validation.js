const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const { ListingCategory } = require("../../../utils/enums/listing.enum");
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
    .withMessage(listingErrorMessages.category.invalid);
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
    .if(body("type").equals("product")) // Only validate stock for products
    .notEmpty()
    .withMessage(listingErrorMessages.stock.required)
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

const paramIdValidation = (fieldName) => {
  return param(fieldName)
    .notEmpty()
    .withMessage(userErrorMessages.mongoId.required)
    .bail()
    .isMongoId()
    .withMessage(userErrorMessages.mongoId.invalid.format);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================
const validateCreateListing = [
  listingTypeValidation("type"),
  listingNameValidation("name"),
  listingDescriptionValidation("description"),
  listingPriceValidation("price"),
  listingCategoryValidation("category"),
  listingImagesValidation("images"),
  listingStockValidation("stock"),
  handleValidationErrors,
];

const validateUpdateListing = [
  // Make all fields optional for updates (unlike creation)
  listingTypeValidation("type").optional(),
  listingNameValidation("name").optional(),
  listingDescriptionValidation("description").optional(),
  listingPriceValidation("price").optional(),
  listingCategoryValidation("category").optional(),
  listingImagesValidation("images").optional(),
  listingStockValidation("stock").optional(),
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
};
