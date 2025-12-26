const express = require("express");
const {
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
  getDeliverySettings,
  updateDeliverySettings,
} = require("../../controllers/user/merchant.controller");

const { authenticateUser } = require("../../middleware/auth");
const {
  validateCreateMerchant,
  validateUpdateMerchant,
  validateShopSlug,
  validateSearchMerchants,
  validateUpdateMetrics,
  validateUpdateRating,
  validateUpdateStatus,
  validateUpdateDeliverySettings,
} = require("../../middleware/validations/user/merchant.validation");

/**
 * Merchant Routes
 *
 * PURPOSE: Define all merchant-related API endpoints
 * SCOPE: Shop management, search, metrics, admin functions
 * AUTHENTICATION: Most routes require authentication, some are public
 * VALIDATION: All input data is validated before processing
 *
 * ROUTE STRUCTURE:
 * - /api/merchants/profile (merchant management)
 * - /api/merchants/search (public discovery)
 * - /api/merchants/shop/:slug (public shop view)
 * - /api/merchants/stats (merchant analytics)
 * - /api/merchants/:userId/* (admin functions)
 * - /api/merchants/admin/* (admin-only endpoints)
 */

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/merchants/search
 * @desc    Search merchants/shops (public)
 * @access  Public
 * @query   q, category, minRating, page, limit
 */
router.get("/search", validateSearchMerchants, searchMerchants);

/**
 * @route   GET /api/merchants/shop/:shopSlug
 * @desc    Get merchant details by shop slug (public)
 * @access  Public
 * @param   shopSlug - URL-safe shop identifier
 */
router.get("/shop/:shopSlug", validateShopSlug, getMerchantBySlug);

/**
 * @route   POST /api/merchants/shop/:shopSlug/view
 * @desc    Track shop view (increment view counter)
 * @access  Public
 * @param   shopSlug - URL-safe shop identifier
 */
router.post("/shop/:shopSlug/view", validateShopSlug, trackShopView);

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(authenticateUser);

/**
 * @route   GET /api/merchants/profile
 * @desc    Get current user's merchant profile
 * @access  Private (merchant only)
 */
router.get("/profile", getMerchantProfile);

/**
 * @route   POST /api/merchants/profile
 * @desc    Create merchant profile for current user
 * @access  Private (must have merchant role)
 */
router.post("/profile", validateCreateMerchant, createOrUpdateMerchant);

/**
 * @route   PUT /api/merchants/profile
 * @desc    Update current user's merchant profile
 * @access  Private (merchant only)
 */
router.put("/profile", validateUpdateMerchant, createOrUpdateMerchant);

/**
 * @route   GET /api/merchants/stats
 * @desc    Get current merchant's statistics and metrics
 * @access  Private (merchant only)
 */
router.get("/stats", getMerchantStats);

/**
 * @route   GET /api/merchants/settings/delivery
 * @desc    Get current merchant's delivery fee settings
 * @access  Private (merchant only)
 * @returns Merchant's custom delivery fees or platform defaults
 */
router.get("/settings/delivery", getDeliverySettings);

/**
 * @route   PUT /api/merchants/settings/delivery
 * @desc    Update current merchant's delivery fee settings
 * @access  Private (merchant only)
 * @body    personalDeliveryFee, campusDeliveryFee, pickupFee, freeDeliveryThreshold, deliverableCampuses
 */
router.put(
  "/settings/delivery",
  validateUpdateDeliverySettings,
  updateDeliverySettings
);

/**
 * @route   POST /api/merchants/verify-email/submit
 * @desc    Submit UiTM email for merchant verification
 * @access  Private (authenticated users)
 */
router.post("/verify-email/submit", submitMerchantVerification);

/**
 * @route   POST /api/merchants/verify-email/confirm
 * @desc    Confirm UiTM email verification with token
 * @access  Private (authenticated users)
 */
router.post("/verify-email/confirm", verifyMerchantEmail);

/**
 * @route   PUT /api/merchants/business-email
 * @desc    Update business contact email (public)
 * @access  Private (merchant only)
 */
router.put("/business-email", updateBusinessEmail);

/**
 * @route   POST /api/merchants/sync-listings
 * @desc    Manually sync merchant data to all listings
 * @access  Private (merchant only)
 */
router.post("/sync-listings", syncMerchantListings);

// ==================== ADMIN/SYSTEM ROUTES ====================

/**
 * @route   PUT /api/merchants/:userId/metrics
 * @desc    Update shop metrics (internal/admin use)
 * @access  Private (admin or self)
 * @param   userId - Target merchant's user ID
 */
router.put("/:userId/metrics", validateUpdateMetrics, updateShopMetrics);

/**
 * @route   PUT /api/merchants/:userId/rating
 * @desc    Update shop rating (internal use - called by review system)
 * @access  Private (system use)
 * @param   userId - Target merchant's user ID
 */
router.put("/:userId/rating", validateUpdateRating, updateShopRating);

/**
 * @route   PUT /api/merchants/:userId/status
 * @desc    Update shop status and verification (admin only)
 * @access  Private (admin only)
 * @param   userId - Target merchant's user ID
 */
router.put("/:userId/status", validateUpdateStatus, updateShopStatus);

/**
 * @route   GET /api/merchants/admin/all
 * @desc    Get all merchants for admin management
 * @access  Private (admin only)
 * @query   status, verificationStatus, page, limit
 */
router.get("/admin/all", getAllMerchants);

module.exports = router;
