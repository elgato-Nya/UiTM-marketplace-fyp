const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

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
  isValidDeliveryFee,
  isValidFreeThreshold,
  isValidDeliverableCampuses,
} = MerchantValidator;
const errorMessages = merchantErrorMessages();

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
      return isValidShopName(value);
    })
    .withMessage(errorMessages.shopName.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopSlug.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopDescription.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopLogo.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopBanner.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.businessRegistration.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.taxId.invalid);
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopName.invalid),
  validateShopSlugField(),
  validateShopDescriptionField(),
  validateShopLogoField(),
  validateShopBannerField(),
  validateBusinessRegistrationField(),
  validateTaxIdField(),
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopSlug.invalid),
  handleValidationErrors,
];

/**
 * Validate search merchants query
 */
const validateSearchMerchants = [
  query("q")
    .optional({ checkFalsy: true }) // Skip validation if empty/undefined/null
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
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
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.shopStatus.invalid),
  body("verificationStatus")
    .optional()
    .custom((value) => {
      if (value && !isValidVerificationStatus(value)) {
        return false;
      }
      return true;
    })
    .withMessage(errorMessages.verificationStatus.invalid),
  handleValidationErrors,
];

/**
 * Validate update delivery settings request
 */
const validateUpdateDeliverySettings = [
  body("personalDeliveryFee")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Personal delivery fee must be between RM0 and RM100")
    .custom((value) => {
      return isValidDeliveryFee(value);
    })
    .withMessage(errorMessages.deliveryFee.invalidFee),
  body("campusDeliveryFee")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Campus delivery fee must be between RM0 and RM100")
    .custom((value) => {
      return isValidDeliveryFee(value);
    })
    .withMessage(errorMessages.deliveryFee.invalidFee),
  body("pickupFee")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Pickup fee must be between RM0 and RM100")
    .custom((value) => {
      return isValidDeliveryFee(value);
    })
    .withMessage(errorMessages.deliveryFee.invalidFee),
  body("freeDeliveryThreshold")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Free delivery threshold must be a non-negative number")
    .custom((value) => {
      return isValidFreeThreshold(value);
    })
    .withMessage(errorMessages.deliveryFee.invalidThreshold),
  body("deliverableCampuses")
    .optional()
    .isArray()
    .withMessage("Deliverable campuses must be an array")
    .custom((value) => {
      return isValidDeliverableCampuses(value);
    })
    .withMessage(errorMessages.deliveryFee.invalidCampuses),
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
  validateUpdateDeliverySettings,
};
