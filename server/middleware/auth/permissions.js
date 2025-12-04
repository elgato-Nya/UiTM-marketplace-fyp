/**
 * Permissions Middleware
 *
 * PURPOSE: Control access to sensitive user data (private emails)
 * USAGE: Add to routes that expose user profiles
 * SECURITY: Protects verification emails from public access
 */

const { createAuthError } = require("../../utils/errors");
const logger = require("../../utils/logger");

/**
 * Check if user is viewing their own profile
 * Sets req.isOwnProfile for downstream middleware
 */
const isOwnProfile = (req, res, next) => {
  const requestedUserId = req.params.userId || req.params.id;
  const currentUserId = req.user?.userId;

  req.isOwnProfile = requestedUserId === currentUserId;
  next();
};

/**
 * Restrict private email viewing to owner or admin
 * Must be used after authentication middleware
 */
const canViewPrivateEmails = (req, res, next) => {
  const requestedUserId = req.params.userId || req.params.id;
  const currentUserId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  // Allow if viewing own profile or is admin
  if (currentUserId === requestedUserId || userRoles.includes("admin")) {
    return next();
  }

  logger.security("Unauthorized attempt to view private emails", {
    requestedUserId,
    currentUserId,
    action: "view_private_emails",
  });

  throw createAuthError(
    "You don't have permission to view private email information",
    "FORBIDDEN"
  );
};

/**
 * Restrict merchant verification data to owner or admin
 */
const canViewMerchantVerification = (req, res, next) => {
  const requestedUserId = req.params.userId || req.params.id;
  const currentUserId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  // Allow if viewing own profile or is admin
  if (currentUserId === requestedUserId || userRoles.includes("admin")) {
    return next();
  }

  logger.security("Unauthorized attempt to view merchant verification", {
    requestedUserId,
    currentUserId,
    action: "view_merchant_verification",
  });

  throw createAuthError(
    "You don't have permission to view merchant verification information",
    "FORBIDDEN"
  );
};

/**
 * Ensure user is a verified merchant
 */
const requireVerifiedMerchant = async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(createAuthError("Authentication required", "AUTH_REQUIRED"));
  }

  try {
    const { User } = require("../../models/user");
    const user = await User.findById(userId).select(
      "+merchantDetails.isUiTMVerified"
    );

    if (!user) {
      return next(createAuthError("User not found", "USER_NOT_FOUND"));
    }

    if (!user.roles.includes("merchant")) {
      return next(createAuthError("Merchant role required", "NOT_MERCHANT"));
    }

    if (!user.merchantDetails?.isUiTMVerified) {
      return next(
        createAuthError(
          "Merchant verification required. Please verify your UiTM email.",
          "MERCHANT_NOT_VERIFIED"
        )
      );
    }

    next();
  } catch (error) {
    logger.error("Error checking merchant verification", {
      userId,
      error: error.message,
    });
    next(error);
  }
};

module.exports = {
  isOwnProfile,
  canViewPrivateEmails,
  canViewMerchantVerification,
  requireVerifiedMerchant,
};
