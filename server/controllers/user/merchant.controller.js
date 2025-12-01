const BaseController = require("../base.controller");
const { merchantService } = require("../../services/user");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");

/**
 * Merchant Controller
 *
 * PURPOSE: Handle merchant-specific HTTP requests and responses
 * SCOPE: Shop management, merchant verification, shop search, metrics
 * PATTERN: Function-based approach with BaseController utilities
 * FEATURES:
 * - Shop CRUD operations
 * - Merchant profile management
 * - Shop search and discovery
 * - Metrics and rating updates
 * - Admin verification functions
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
};
