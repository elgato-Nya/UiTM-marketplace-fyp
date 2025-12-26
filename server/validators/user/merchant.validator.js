/**
 * Merchant Validator Utilities
 *
 * PURPOSE: Validate merchant-specific data (shop names, slugs, descriptions, etc.)
 * PATTERN: Individual validator functions + centralized error messages
 * USAGE: Used in Mongoose schemas and Express validation middleware
 * FEATURES:
 * - Shop name validation (length, format, uniqueness)
 * - Shop slug validation (URL-safe format)
 * - Shop description validation
 * - Business registration validation
 * - Category validation
 * - Email validation (verification & business emails)
 */

// Import email validators from UserValidator
const { UserValidator } = require("./user.validator");
const { isValidUiTMEmail, isValidEmail } = UserValidator;

// Import CampusEnum for campus validation
const { CampusEnum } = require("../../utils/enums/user.enum");

class MerchantValidator {
  /**
   * Validate UiTM verification email (for merchant verification)
   * RULES: Must be valid UiTM email format
   */
  static isValidVerificationEmail(email) {
    return isValidUiTMEmail(email);
  }

  /**
   * Validate business email (any domain, optional)
   * RULES: Must be valid email format if provided
   */
  static isValidBusinessEmail(email) {
    if (!email) return true; // Optional field
    return isValidEmail(email);
  }
  /**
   * Validate shop name
   * RULES: 3-50 characters, alphanumeric + spaces/hyphens, trimmed
   */
  static isValidShopName(shopName) {
    if (!shopName || typeof shopName !== "string") return false;

    if (shopName.length < 3 || shopName.length > 50) return false;

    // must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and periods
    const shopNameRegex = /^[a-zA-Z0-9\s\-'&.]+$/;
    if (!shopNameRegex.test(shopName)) return false;

    // No consecutive spaces or hyphens
    if (/\s{2,}|--/.test(shopName)) return false;

    // Must start and end with alphanumeric
    if (!/^[a-zA-Z0-9]/.test(shopName) || !/[a-zA-Z0-9]$/.test(shopName))
      return false;

    return true;
  }

  /**
   * Validate shop slug
   * RULES: lowercase, alphanumeric + hyphens, URL-safe, 3-50 characters
   */
  static isValidShopSlug(slug) {
    if (!slug || typeof slug !== "string") return false;

    const normalizedSlug = slug.toLowerCase();
    if (normalizedSlug.length < 3 || normalizedSlug.length > 50) return false;

    // Format check: lowercase letters, numbers, hyphens only
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(normalizedSlug)) return false;

    // No consecutive hyphens
    if (/--/.test(normalizedSlug)) return false;

    // Must start and end with alphanumeric
    if (!/^[a-z0-9]/.test(normalizedSlug) || !/[a-z0-9]$/.test(normalizedSlug))
      return false;

    // Reserved slugs (prevent conflicts with routes)
    const reservedSlugs = [
      "admin",
      "api",
      "app",
      "www",
      "mail",
      "ftp",
      "shop",
      "store",
      "merchant",
      "user",
      "profile",
      "settings",
      "dashboard",
      "help",
      "support",
      "about",
      "contact",
      "terms",
      "privacy",
      "login",
      "register",
      "signup",
      "signin",
      "logout",
      "auth",
      "account",
    ];

    if (reservedSlugs.includes(normalizedSlug)) return false;

    return true;
  }

  /**
   * Validate shop description
   * RULES: Optional, max 200 characters, no HTML tags
   */
  static isValidShopDescription(description) {
    if (!description) return true; // Optional field

    if (typeof description !== "string") return false;

    if (description.length > 200) return false;

    return true;
  }

  /**
   * Validate business registration number
   * RULES: Optional, alphanumeric + hyphens, 5-20 characters
   */
  static isValidBusinessRegistration(regNumber) {
    if (!regNumber) return true; // Optional field
    if (typeof regNumber !== "string") return false;

    if (regNumber.length < 5 || regNumber.length > 20) return false;

    // Format check: alphanumeric + hyphens
    const regRegex = /^[a-zA-Z0-9-]+$/;
    if (!regRegex.test(regNumber)) return false;

    return true;
  }

  /**
   * Validate tax ID
   * RULES: Optional, alphanumeric + hyphens, 5-15 characters
   */
  static isValidTaxId(taxId) {
    if (!taxId) return true; // Optional field

    if (typeof taxId !== "string") return false;

    if (taxId.length < 5 || taxId.length > 15) return false;

    // Format check: alphanumeric + hyphens
    const taxRegex = /^[a-zA-Z0-9-]+$/;
    if (!taxRegex.test(taxId)) return false;

    return true;
  }

  /**
   * Validate shop categories
   * RULES: Array of strings, max 5 categories, each 2-30 characters
   */
  static isValidShopCategories(categories) {
    if (!categories) return true; // Optional field
    if (!Array.isArray(categories)) return false;

    // Max 5 categories
    if (categories.length > 5) return false;

    // Validate each category
    for (const category of categories) {
      if (typeof category !== "string") return false;

      const trimmed = category.trim();
      if (trimmed.length < 2 || trimmed.length > 30) return false;

      // Only letters, numbers, spaces, hyphens
      if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) return false;
    }

    // Check for duplicates (case-insensitive)
    const lowercaseCategories = categories.map((cat) =>
      cat.toLowerCase().trim()
    );
    const uniqueCategories = [...new Set(lowercaseCategories)];
    if (uniqueCategories.length !== categories.length) return false;

    return true;
  }

  /**
   * Validate shop status
   * RULES: Must be one of predefined values
   */
  static isValidShopStatus(status) {
    const validStatuses = [
      "active",
      "suspended",
      "pending_verification",
      "closed",
    ];
    return validStatuses.includes(status);
  }

  /**
   * Validate verification status
   * RULES: Must be one of predefined values
   */
  static isValidVerificationStatus(status) {
    const validStatuses = ["unverified", "pending", "verified", "rejected"];
    return validStatuses.includes(status);
  }

  /**
   * Validate image URL/path
   * RULES: Must be valid URL or local file path
   */
  static isValidImageUrl(url) {
    if (!url) return true; // Optional field
    if (typeof url !== "string") return false;

    // Check if it's a valid URL or local path
    const urlRegex = /^(https?:\/\/)|(\/uploads\/)/;
    return urlRegex.test(url);
  }

  // ================== DELIVERY FEE VALIDATION ==================

  /**
   * Validate delivery fee amount
   * RULES: Numeric, 0-100 range (RM)
   */
  static isValidDeliveryFee(fee) {
    if (typeof fee !== "number") return false;
    if (Number.isNaN(fee)) return false;
    if (fee < 0 || fee > 100) return false;
    return true;
  }

  /**
   * Validate free delivery threshold
   * RULES: Numeric, 0 or positive (RM)
   */
  static isValidFreeThreshold(threshold) {
    if (typeof threshold !== "number") return false;
    if (Number.isNaN(threshold)) return false;
    if (threshold < 0) return false;
    return true;
  }

  /**
   * Validate deliverable campuses array
   * RULES: Array of valid CampusEnum keys, no duplicates
   */
  static isValidDeliverableCampuses(campuses) {
    if (!Array.isArray(campuses)) return false;

    const validCampusKeys = Object.keys(CampusEnum);

    // Check each campus is a valid string key
    for (const campus of campuses) {
      if (typeof campus !== "string") return false;
      if (!validCampusKeys.includes(campus)) return false;
    }

    // Check for duplicates
    const uniqueCampuses = [...new Set(campuses)];
    if (uniqueCampuses.length !== campuses.length) return false;

    return true;
  }
}

/**
 * Centralized error messages for merchant validation
 */
const merchantErrorMessages = () => ({
  shopName: {
    required: "Shop name is required for merchants",
    invalid:
      "Shop name must be 3-50 characters, contain only letters, numbers, spaces, hyphens, apostrophes, and ampersands",
    format: "Shop name must start and end with a letter or number",
    unique: "Shop name already exists",
  },
  shopSlug: {
    invalid:
      "Shop slug must be 3-50 characters, contain only lowercase letters, numbers, and hyphens",
    format: "Shop slug must start and end with a letter or number",
    reserved: "This shop slug is reserved and cannot be used",
    unique: "Shop slug already exists",
  },
  shopDescription: {
    invalid:
      "Shop description cannot exceed 200 characters and must not contain HTML tags",
  },
  businessRegistration: {
    invalid:
      "Business registration number must be 5-20 characters, containing only letters, numbers, and hyphens",
  },
  taxId: {
    invalid:
      "Tax ID must be 5-15 characters, containing only letters, numbers, and hyphens",
  },
  shopCategories: {
    invalid:
      "Shop categories must be an array of strings, maximum 5 categories",
    format:
      "Each category must be 2-30 characters, containing only letters, numbers, spaces, and hyphens",
    duplicate: "Duplicate categories are not allowed",
  },
  shopStatus: {
    invalid:
      "Shop status must be one of: active, suspended, pending_verification, closed",
  },
  verificationStatus: {
    invalid:
      "Verification status must be one of: unverified, pending, verified, rejected",
  },
  shopLogo: {
    invalid: "Shop logo must be a valid URL or file path",
  },
  shopBanner: {
    invalid: "Shop banner must be a valid URL or file path",
  },
  // ================== NEW: Email Validation Messages ==================
  verificationEmail: {
    required: "UiTM email is required for merchant verification",
    invalid:
      "Verification email must be a valid UiTM email address (e.g., user@uitm.edu.my)",
    unique: "This UiTM email is already used for merchant verification",
  },
  businessEmail: {
    invalid: "Business email must be a valid email address",
  },
  // ================== NEW: Delivery Fee Validation Messages ==================
  deliveryFee: {
    invalidFee: "Delivery fee must be a number between 0 and 100 (RM)",
    invalidThreshold:
      "Free delivery threshold must be a non-negative number (RM)",
    invalidCampuses:
      "Deliverable campuses must be an array of valid campus keys from CampusEnum, with no duplicates",
  },
});

module.exports = {
  MerchantValidator,
  merchantErrorMessages,
};
