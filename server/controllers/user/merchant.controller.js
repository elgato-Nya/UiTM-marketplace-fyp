const BaseController = require("../base.controller");
const { merchantService } = require("../../services/user");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const { MerchantValidator } = require("../../validators/user");
const { Listing } = require("../../models");
const mongoose = require("mongoose");

/**
 * Merchant Controller
 *
 * PURPOSE: Handle merchant-specific HTTP requests and responses
 * SCOPE: Shop management, merchant verification, shop search, metrics, delivery settings
 * PATTERN: Function-based approach with BaseController utilities
 * FEATURES:
 * - Shop CRUD operations
 * - Merchant profile management
 * - Shop search and discovery
 * - Metrics and rating updates
 * - Admin verification functions
 * - Delivery fee settings management
 */

// Create BaseController instance for utility methods
const baseController = new BaseController();

/**
 * Get merchant details (auto-creates shop if doesn't exist)
 * GET /api/merchants/profile
 */
const getMerchantProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Use getOrCreateShop to ensure shop exists
  const result = await merchantService.getOrCreateShop(userId);

  baseController.logAction("get_merchant_profile", req, {
    userId,
    isNewShop: result.isNew,
  });

  return baseController.sendSuccess(
    res,
    result,
    result.isNew
      ? "Shop created successfully from your profile"
      : "Merchant profile retrieved successfully"
  );
}, "get_merchant_profile");

/**
 * Create or update merchant details
 * POST /api/merchants/profile
 * PUT /api/merchants/profile
 */
const createOrUpdateMerchant = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const merchantData = sanitizeObject(req.body);

  const result = await merchantService.createOrUpdateMerchantDetails(
    userId,
    merchantData
  );

  const action = req.method === "POST" ? "create_merchant" : "update_merchant";
  const message =
    req.method === "POST"
      ? "Merchant profile created successfully"
      : "Merchant profile updated successfully";

  baseController.logAction(action, req, {
    userId,
    shopName: merchantData.shopName,
  });

  return baseController.sendSuccess(res, result, message, 201);
}, "create_update_merchant");

/**
 * Get merchant by shop slug (public)
 * GET /api/merchants/shop/:shopSlug
 */
const getMerchantBySlug = asyncHandler(async (req, res) => {
  const { shopSlug } = req.params;
  const merchantData = await merchantService.getMerchantBySlug(shopSlug);

  return baseController.sendSuccess(
    res,
    merchantData,
    "Shop details retrieved successfully"
  );
}, "get_merchant_by_slug");

/**
 * Search merchants/shops (public)
 * GET /api/merchants/search?q=query&category=tech&minRating=4&page=1&limit=10
 */
const searchMerchants = asyncHandler(async (req, res) => {
  const {
    q: searchQuery,
    category,
    minRating,
    page = 1,
    limit = 10,
  } = sanitizeQuery(req.query);

  const filters = {};
  if (category) filters.category = category;
  if (minRating) filters.minRating = parseFloat(minRating);

  const pagination = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50), // Max 50 results per page
  };

  const results = await merchantService.searchMerchants(
    searchQuery,
    filters,
    pagination
  );

  return baseController.sendSuccess(
    res,
    results,
    "Merchants retrieved successfully"
  );
}, "search_merchants");

/**
 * Get merchant statistics (merchant only)
 * GET /api/merchants/stats
 */
const getMerchantStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const stats = await merchantService.getMerchantStats(userId);

  baseController.logAction("get_merchant_stats", req, { userId });
  return baseController.sendSuccess(
    res,
    stats,
    "Merchant statistics retrieved successfully"
  );
}, "get_merchant_stats");

/**
 * Update shop metrics (internal/admin use)
 * PUT /api/merchants/:userId/metrics
 */
const updateShopMetrics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const metrics = sanitizeObject(req.body);

  // Ensure only admins can update other users' metrics
  if (req.user._id.toString() !== userId && !req.user.roles.includes("admin")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Cannot update other merchant's metrics",
    });
  }

  const result = await merchantService.updateShopMetrics(userId, metrics);

  baseController.logAction("update_shop_metrics", req, {
    targetUserId: userId,
    metrics,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Shop metrics updated successfully"
  );
}, "update_shop_metrics");

/**
 * Update shop rating (internal use - called by review system)
 * PUT /api/merchants/:userId/rating
 */
const updateShopRating = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { rating, isNewReview = true } = sanitizeObject(req.body);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  const result = await merchantService.updateShopRating(
    userId,
    parseFloat(rating),
    isNewReview
  );

  baseController.logAction("update_shop_rating", req, {
    targetUserId: userId,
    rating,
    isNewReview,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Shop rating updated successfully"
  );
}, "update_shop_rating");

/**
 * Update shop status (admin only)
 * PUT /api/merchants/:userId/status
 */
const updateShopStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { shopStatus, verificationStatus } = sanitizeObject(req.body);

  // Admin only endpoint
  if (!req.user.roles.includes("admin")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  const result = await merchantService.updateShopStatus(
    userId,
    shopStatus,
    verificationStatus
  );

  baseController.logAction("update_shop_status", req, {
    targetUserId: userId,
    shopStatus,
    verificationStatus,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Shop status updated successfully"
  );
}, "update_shop_status");

/**
 * Get all merchants (admin only)
 * GET /api/merchants/admin/all?status=pending&page=1&limit=20
 */
const getAllMerchants = asyncHandler(async (req, res) => {
  // Admin only endpoint
  if (!req.user.roles.includes("admin")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  const {
    status,
    verificationStatus,
    page = 1,
    limit = 20,
  } = sanitizeQuery(req.query);

  const filters = {};
  if (status) filters.shopStatus = status;
  if (verificationStatus) filters.verificationStatus = verificationStatus;

  const pagination = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100), // Max 100 for admin
  };

  const results = await merchantService.searchMerchants(
    "", // No search query for admin list
    filters,
    pagination
  );

  baseController.logAction("get_all_merchants", req, { filters, pagination });
  return baseController.sendSuccess(
    res,
    results,
    "All merchants retrieved successfully"
  );
}, "get_all_merchants");

/**
 * Track shop view (public)
 * POST /api/merchants/shop/:shopSlug/view
 */
const trackShopView = asyncHandler(async (req, res) => {
  const { shopSlug } = req.params;
  const result = await merchantService.trackShopView(shopSlug);

  baseController.logAction("track_shop_view", req, { shopSlug });
  return baseController.sendSuccess(
    res,
    result,
    "Shop view tracked successfully"
  );
}, "track_shop_view");

/**
 * Manually sync merchant data to listings
 * POST /api/merchants/sync-listings
 */
const syncMerchantListings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await merchantService.syncMerchantDataToListings(userId, {
    username: req.user.profile.username,
    shopName: req.user.merchantDetails?.shopName,
    shopSlug: req.user.merchantDetails?.shopSlug,
    isVerified: req.user.merchantDetails?.isVerified || false,
  });

  baseController.logAction("sync_merchant_listings", req, { userId });
  return baseController.sendSuccess(
    res,
    result,
    `Successfully synced data to ${result.modifiedCount} listings`
  );
}, "sync_merchant_listings");

/**
 * Submit UiTM email for merchant verification
 * POST /api/merchants/verify-email/submit
 */
const submitMerchantVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { verificationEmail } = sanitizeObject(req.body);

  if (!verificationEmail) {
    return res.status(400).json({
      success: false,
      message: "Verification email is required",
    });
  }

  const result = await merchantService.submitMerchantVerification(
    userId,
    verificationEmail
  );

  baseController.logAction("submit_merchant_verification", req, {
    userId,
    verificationEmail: verificationEmail.substring(0, 3) + "***", // Log partial for privacy
  });

  return baseController.sendSuccess(
    res,
    result,
    result.status === "already_verified"
      ? "Your merchant account is already verified"
      : "Verification email sent. Please check your UiTM inbox."
  );
}, "submit_merchant_verification");

/**
 * Verify UiTM email with token
 * POST /api/merchants/verify-email/confirm
 */
const verifyMerchantEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { token } = sanitizeObject(req.body);

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is required",
    });
  }

  const result = await merchantService.verifyMerchantEmail(userId, token);

  baseController.logAction("verify_merchant_email", req, {
    userId,
    verificationDate: result.verificationDate,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Your UiTM email has been verified! You now have permanent merchant status."
  );
}, "verify_merchant_email");

/**
 * Update business email (public contact)
 * PUT /api/merchants/business-email
 */
const updateBusinessEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { businessEmail } = sanitizeObject(req.body);

  const result = await merchantService.updateBusinessEmail(
    userId,
    businessEmail || null
  );

  baseController.logAction("update_business_email", req, {
    userId,
    hasBusinessEmail: !!result.businessEmail,
  });

  return baseController.sendSuccess(
    res,
    result,
    result.businessEmail
      ? "Business email updated successfully"
      : "Business email removed successfully"
  );
}, "update_business_email");

// ================== DELIVERY FEE SETTINGS ==================

/**
 * Get merchant's delivery fee settings
 * GET /api/merchants/settings/delivery
 */
const getDeliverySettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get merchant with delivery fees
  const merchant = await merchantService.getMerchantById(userId);

  if (!merchant) {
    return res.status(404).json({
      success: false,
      message: "Merchant not found",
    });
  }

  // Return delivery settings (will have defaults from schema if not customized)
  const deliverySettings = {
    personal: merchant.merchantDetails?.deliveryFees?.personal || {
      enabled: true,
      fee: 5.0,
    },
    campus: merchant.merchantDetails?.deliveryFees?.campus || {
      enabled: true,
      fee: 2.5,
    },
    pickup: merchant.merchantDetails?.deliveryFees?.pickup || {
      enabled: true,
      fee: 1.0,
    },
    freeDeliveryThreshold: merchant.merchantDetails?.freeDeliveryThreshold || 0,
    deliverableCampuses: merchant.merchantDetails?.deliverableCampuses || [],
  };

  baseController.logAction("get_delivery_settings", req, { userId });

  return baseController.sendSuccess(
    res,
    deliverySettings,
    "Delivery settings retrieved successfully"
  );
}, "get_delivery_settings");

/**
 * Update merchant's delivery fee settings
 * PUT /api/merchants/settings/delivery
 */
const updateDeliverySettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    personalDeliveryFee,
    campusDeliveryFee,
    pickupFee,
    freeDeliveryThreshold,
    deliverableCampuses,
  } = sanitizeObject(req.body);

  // Validate delivery fees if provided
  if (personalDeliveryFee !== undefined) {
    if (!MerchantValidator.isValidDeliveryFee(personalDeliveryFee)) {
      return res.status(400).json({
        success: false,
        message: "Invalid personal delivery fee. Must be between 0 and 100 RM.",
      });
    }
  }

  if (campusDeliveryFee !== undefined) {
    if (!MerchantValidator.isValidDeliveryFee(campusDeliveryFee)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campus delivery fee. Must be between 0 and 100 RM.",
      });
    }
  }

  if (pickupFee !== undefined) {
    if (!MerchantValidator.isValidDeliveryFee(pickupFee)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup fee. Must be between 0 and 100 RM.",
      });
    }
  }

  if (freeDeliveryThreshold !== undefined) {
    if (!MerchantValidator.isValidFreeThreshold(freeDeliveryThreshold)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid free delivery threshold. Must be a non-negative number.",
      });
    }
  }

  // Validate deliverable campuses if provided
  if (deliverableCampuses !== undefined) {
    if (!MerchantValidator.isValidDeliverableCampuses(deliverableCampuses)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid deliverable campuses. Must be an array of valid campus keys with no duplicates.",
      });
    }
  }

  // Build update object
  const updateData = {};

  if (personalDeliveryFee !== undefined) {
    updateData["merchantDetails.deliveryFees.personal.fee"] =
      personalDeliveryFee;
    updateData["merchantDetails.deliveryFees.personal.enabled"] =
      personalDeliveryFee > 0;
  }

  if (campusDeliveryFee !== undefined) {
    updateData["merchantDetails.deliveryFees.campus.fee"] = campusDeliveryFee;
    updateData["merchantDetails.deliveryFees.campus.enabled"] =
      campusDeliveryFee > 0;
  }

  if (pickupFee !== undefined) {
    updateData["merchantDetails.deliveryFees.pickup.fee"] = pickupFee;
    updateData["merchantDetails.deliveryFees.pickup.enabled"] = pickupFee > 0;
  }

  if (freeDeliveryThreshold !== undefined) {
    updateData["merchantDetails.freeDeliveryThreshold"] = freeDeliveryThreshold;
  }

  if (deliverableCampuses !== undefined) {
    updateData["merchantDetails.deliverableCampuses"] = deliverableCampuses;
  }

  // Update merchant settings
  const result = await merchantService.updateMerchantSettings(
    userId,
    updateData
  );

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Merchant not found",
    });
  }

  baseController.logAction("update_delivery_settings", req, {
    userId,
    personalFee: personalDeliveryFee,
    campusFee: campusDeliveryFee,
    pickupFee,
    threshold: freeDeliveryThreshold,
    campusCount: deliverableCampuses?.length || 0,
  });

  // Return formatted response
  const responseData = {
    personal: result.merchantDetails?.deliveryFees?.personal || {
      enabled: true,
      fee: 5.0,
    },
    campus: result.merchantDetails?.deliveryFees?.campus || {
      enabled: true,
      fee: 2.5,
    },
    pickup: result.merchantDetails?.deliveryFees?.pickup || {
      enabled: true,
      fee: 1.0,
    },
    freeDeliveryThreshold: result.merchantDetails?.freeDeliveryThreshold || 0,
    deliverableCampuses: result.merchantDetails?.deliverableCampuses || [],
  };

  return baseController.sendSuccess(
    res,
    responseData,
    "Delivery settings updated successfully"
  );
}, "update_delivery_settings");

/**
 * Get delivery fees for a specific listing (public)
 * GET /api/listings/:id/delivery-fees
 */
const getListingDeliveryFees = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate listing ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid listing ID",
    });
  }

  // Get listing
  const listing = await Listing.findById(id).select("seller.userId");

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found",
    });
  }

  // Get merchant's delivery settings
  const merchant = await merchantService.getMerchantById(listing.seller.userId);

  if (!merchant) {
    return res.status(404).json({
      success: false,
      message: "Merchant not found",
    });
  }

  // Extract delivery settings from merchant
  const deliveryFees = merchant.deliveryFees || {
    personal: { enabled: true, fee: 5.0 },
    campus: { enabled: true, fee: 2.5 },
    pickup: { enabled: true, fee: 1.0 },
  };

  const deliverableCampuses = merchant.deliverableCampuses || [];
  const freeDeliveryThreshold = merchant.freeDeliveryThreshold || 0;

  // Format response to match frontend expectations
  const deliverySettings = {
    personal: {
      enabled: deliveryFees.personal?.enabled !== false,
      fee: deliveryFees.personal?.fee || 5.0,
    },
    campus: {
      enabled: deliveryFees.campus?.enabled !== false,
      fee: deliveryFees.campus?.fee || 2.5,
    },
    pickup: {
      enabled: deliveryFees.pickup?.enabled !== false,
      fee: deliveryFees.pickup?.fee || 1.0,
    },
    freeDeliveryThreshold,
    deliverableCampuses,
  };

  baseController.logAction("get_listing_delivery_fees", req, {
    listingId: id,
    merchantId: listing.seller.userId,
  });

  return baseController.sendSuccess(
    res,
    deliverySettings,
    "Delivery fees retrieved successfully"
  );
}, "get_listing_delivery_fees");

module.exports = {
  getMerchantProfile,
  createOrUpdateMerchant,
  getMerchantBySlug,
  searchMerchants,
  getMerchantStats,
  updateShopMetrics,
  updateShopRating,
  updateShopStatus,
  getAllMerchants,
  trackShopView,
  syncMerchantListings,
  submitMerchantVerification,
  verifyMerchantEmail,
  updateBusinessEmail,
  // Delivery fee settings
  getDeliverySettings,
  updateDeliverySettings,
  getListingDeliveryFees,
};
