const { body, param, query, validationResult } = require("express-validator");

const logger = require("../../../utils/logger");
const {
  MerchantValidator,
  merchantErrorMessages,
} = require("../../../validators/user");

const {
  isValidShopName,
  isValidShopSlug,
  isValidShopDescription,
  isValidBusinessRegistration,
  isValidTaxId,
  isValidShopCategories,
  isValidShopStatus,
  isValidVerificationStatus,
  isValidImageUrl,
} = MerchantValidator;
const errorMessages = merchantErrorMessages();

// ================ VALIDATION ERROR MIDDLEWARE ================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Merchant validation failed", {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      body: req.body,
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// ================ INDIVIDUAL VALIDATION RULES ================

/**
 * Validate shop name field
 */
const validateShopNameField = () => {
  return body("shopName")
    .trim()
    .notEmpty()
    .withMessage(errorMessages.shopName.required)
    .custom((value) => {
      if (!isValidShopName(value)) {
        throw new Error(errorMessages.shopName.invalid);
      }
      return true;
    });
};

/**
 * Validate shop slug field
 */
const validateShopSlugField = () => {
  return body("shopSlug")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidShopSlug(value)) {
        throw new Error(errorMessages.shopSlug.invalid);
      }
      return true;
    });
};

/**
 * Validate shop description field
 */
const validateShopDescriptionField = () => {
  return body("shopDescription")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidShopDescription(value)) {
        throw new Error(errorMessages.shopDescription.invalid);
      }
      return true;
    });
};

/**
 * Validate shop logo field
 */
const validateShopLogoField = () => {
  return body("shopLogo")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidImageUrl(value)) {
        throw new Error(errorMessages.shopLogo.invalid);
      }
      return true;
    });
};

/**
 * Validate shop banner field
 */
const validateShopBannerField = () => {
  return body("shopBanner")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidImageUrl(value)) {
        throw new Error(errorMessages.shopBanner.invalid);
      }
      return true;
    });
};

/**
 * Validate business registration field
 */
const validateBusinessRegistrationField = () => {
  return body("businessRegistrationNumber")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidBusinessRegistration(value)) {
        throw new Error(errorMessages.businessRegistration.invalid);
      }
      return true;
    });
};

/**
 * Validate tax ID field
 */
const validateTaxIdField = () => {
  return body("taxId")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidTaxId(value)) {
        throw new Error(errorMessages.taxId.invalid);
      }
      return true;
    });
};

/**
 * Validate shop categories field
 */
const validateShopCategoriesField = () => {
  return body("shopCategories")
    .optional()
    .isArray()
    .withMessage("Shop categories must be an array")
    .custom((value) => {
      if (value && !isValidShopCategories(value)) {
        throw new Error(errorMessages.shopCategories.invalid);
      }
      return true;
    });
};

// ================ VALIDATION MIDDLEWARE FUNCTIONS ================

/**
 * Validate create merchant request
 */
const validateCreateMerchant = [
  validateShopNameField(),
  validateShopSlugField(),
  validateShopDescriptionField(),
  validateShopLogoField(),
  validateShopBannerField(),
  validateBusinessRegistrationField(),
  validateTaxIdField(),
  validateShopCategoriesField(),
  handleValidationErrors,
];

/**
 * Validate update merchant request
 */
const validateUpdateMerchant = [
  body("shopName")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidShopName(value)) {
        throw new Error(errorMessages.shopName.invalid);
      }
      return true;
    }),
  validateShopSlugField(),
  validateShopDescriptionField(),
  validateShopLogoField(),
  validateShopBannerField(),
  validateBusinessRegistrationField(),
  validateTaxIdField(),
  validateShopCategoriesField(),
  handleValidationErrors,
];

/**
 * Validate shop slug parameter
 */
const validateShopSlug = [
  param("shopSlug")
    .trim()
    .notEmpty()
    .withMessage("Shop slug is required")
    .custom((value) => {
      if (!isValidShopSlug(value)) {
        throw new Error(errorMessages.shopSlug.invalid);
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Validate search merchants query
 */
const validateSearchMerchants = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  query("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Category must be between 2 and 30 characters"),
  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Minimum rating must be between 0 and 5"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  handleValidationErrors,
];

/**
 * Validate update metrics request
 */
const validateUpdateMetrics = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
  body("totalProducts")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total products must be a non-negative integer"),
  body("totalSales")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total sales must be a non-negative integer"),
  body("totalRevenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total revenue must be a non-negative number"),
  handleValidationErrors,
];

/**
 * Validate update rating request
 */
const validateUpdateRating = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
  body("rating")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("isNewReview")
    .optional()
    .isBoolean()
    .withMessage("isNewReview must be a boolean"),
  handleValidationErrors,
];

/**
 * Validate update status request
 */
const validateUpdateStatus = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
  body("shopStatus")
    .optional()
    .custom((value) => {
      if (value && !isValidShopStatus(value)) {
        throw new Error(errorMessages.shopStatus.invalid);
      }
      return true;
    }),
  body("verificationStatus")
    .optional()
    .custom((value) => {
      if (value && !isValidVerificationStatus(value)) {
        throw new Error(errorMessages.verificationStatus.invalid);
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCreateMerchant,
  validateUpdateMerchant,
  validateShopSlug,
  validateSearchMerchants,
  validateUpdateMetrics,
  validateUpdateRating,
  validateUpdateStatus,
};
