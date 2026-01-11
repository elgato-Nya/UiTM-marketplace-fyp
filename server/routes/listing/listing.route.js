const express = require("express");

const {
  handleCreateListing,
  handleGetListing,
  handleGetAllListings,
  handleUpdateListing,
  handleDeleteListing,
  handleToggleAvailability,
  handleGetMyListings,
  handleGetSellerListings,
  handleAddVariant,
  handleUpdateVariant,
  handleDeleteVariant,
  handleGetVariant,
  handleGetListingVariants,
} = require("../../controllers/listing/listing.controller");
const {
  getListingDeliveryFees,
} = require("../../controllers/user/merchant.controller");
const {
  protect,
  authorize,
  isListingOwner,
} = require("../../middleware/auth/auth.middleware");
const {
  validateCreateListing,
  validateUpdateListing,
  validateGetListing,
  validateGetListings,
  validateListingIdParam,
  validatePagination,
  validateSellerIdParam,
  validateAddVariant,
  validateUpdateVariant,
  validateVariantIdParam,
} = require("../../middleware/validations/listing/listing.validation");
const {
  publicReadLimiter,
  standardLimiter,
  writeLimiter,
} = require("../../middleware/limiters.middleware");

/**
 * Listing Routes
 *
 * PURPOSE: Handle marketplace listing operations and management
 * SCOPE: Listing CRUD, seller management, public browsing, availability control
 * AUTHENTICATION: Mixed - public browsing, protected creation/modification
 * AUTHORIZATION: Role-based (merchant/admin for creation), ownership-based for modifications
 * RATE LIMITING: publicReadLimiter for browsing, writeLimiter for create/update
 *
 * ROUTE STRUCTURE:
 * - /api/listings (public listing browsing and merchant listing creation)
 * - /api/listings/:id (individual listing operations)
 * - /api/listings/my-listings (current user's listings)
 * - /api/listings/seller/:sellerId (public seller listings)
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/listings
 * @desc    Get all public listings with pagination and filtering
 * @access  Public
 * @ratelimit 150 requests per 15 minutes
 * @query   page, limit, sort, type, category, fields
 * @returns Paginated public listings (available only)
 * @note    Only shows available listings for public access
 */
router.get(
  "/",
  publicReadLimiter,
  validateGetListings,
  validatePagination,
  handleGetAllListings
);

/**
 * @route   GET /api/listings/seller/:sellerId
 * @desc    Get public seller listings with pagination and filtering
 * @access  Public
 * @ratelimit 150 requests per 15 minutes
 * @params  sellerId - Seller user ID
 * @query   page, limit, sort, type, category, fields
 * @returns Paginated seller listings (available only)
 * @note    Only shows available listings for public access
 */
router.get(
  "/seller/:sellerId",
  publicReadLimiter,
  validateSellerIdParam,
  validateGetListings,
  validatePagination,
  handleGetSellerListings
);

/**
 * @route   GET /api/listings/:id/delivery-fees
 * @desc    Get delivery fee information for a specific listing
 * @access  Public
 * @ratelimit 150 requests per 15 minutes
 * @params  id - Listing ID
 * @returns Delivery fee settings from merchant or platform defaults
 * @note    Public endpoint to show delivery costs before purchase
 */
router.get(
  "/:id/delivery-fees",
  publicReadLimiter,
  validateListingIdParam,
  getListingDeliveryFees
);

// ==================== AUTHENTICATED ROUTES (Must be before /:id) ====================

// Apply authentication middleware to specific routes that need it
/**
 * @route   GET /api/listings/my-listings
 * @desc    Get current user's listings with pagination and filtering
 * @access  Private
 * @query   page, limit, sort, includeUnavailable, type, category, fields
 * @returns Paginated user listings with metadata
 * @note    Shows both available and unavailable listings for owner
 * @note    MUST be before /:id route to avoid matching "my-listings" as an ID
 */
router.get(
  "/my-listings",
  protect,
  validateGetListings,
  validatePagination,
  handleGetMyListings
);

/**
 * @route   GET /api/listings/:id
 * @desc    Get listing by ID with optional seller details
 * @access  Public (Available for guest users to browse)
 * @ratelimit 150 requests per 15 minutes
 * @params  id - Listing ID
 * @query   includeSeller (boolean), fields (comma-separated)
 * @returns Listing data with optional seller information
 * @note    Must come AFTER /seller/:sellerId and /my-listings to avoid route conflict
 * @note    Public access allows guest browsing, but owners see enhanced details
 */
router.get("/:id", publicReadLimiter, validateGetListing, handleGetListing);

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and standard rate limiting middleware to all routes below
router.use(protect);
router.use(standardLimiter);

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private (Merchant only)
 * @ratelimit 50 requests per 15 minutes (write operations)
 * @body    name, description, price, category, type, images, etc.
 * @returns Created listing data
 * @note    Requires merchant role or admin permissions
 */
router.post(
  "/",
  authorize("merchant"),
  writeLimiter,
  validateCreateListing,
  handleCreateListing
);

// ==================== OWNERSHIP-PROTECTED ROUTES ====================

/**
 * @route   PATCH /api/listings/:id
 * @desc    Update existing listing
 * @access  Private (Owner/Admin only)
 * @ratelimit 50 requests per 15 minutes (write operations)
 * @params  id - Listing ID
 * @body    Fields to update (name, description, price, etc.)
 * @returns Updated listing data
 * @note    Ownership verified by isListingOwner middleware
 */
router.patch(
  "/:id",
  isListingOwner("id"),
  writeLimiter,
  validateUpdateListing,
  handleUpdateListing
);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Soft delete listing by marking as unavailable
 * @access  Private (Owner/Admin only)
 * @ratelimit 50 requests per 15 minutes (write operations)
 * @params  id - Listing ID
 * @returns Success confirmation
 * @note    Performs soft delete, ownership verified by middleware
 */
router.delete(
  "/:id",
  isListingOwner("id"),
  writeLimiter,
  validateListingIdParam,
  handleDeleteListing
);

/**
 * @route   PATCH /api/listings/:id/toggle
 * @desc    Toggle listing availability between active and inactive
 * @access  Private (Owner/Admin only)
 * @ratelimit 50 requests per 15 minutes (write operations)
 * @params  id - Listing ID
 * @returns Updated availability status
 * @note    Ownership verified by isListingOwner middleware
 */
router.patch(
  "/toggle-availability/:id",
  isListingOwner("id"),
  writeLimiter,
  validateListingIdParam,
  handleToggleAvailability
);

// ==================== VARIANT MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/listings/:id/variants
 * @desc    Get all variants for a listing
 * @access  Public (Anyone can view variants)
 * @params  id - Listing ID
 * @returns Array of variants for the listing
 * @note    Public endpoint for browsing variant options
 */
router.get("/:id/variants", validateListingIdParam, handleGetListingVariants);

/**
 * @route   GET /api/listings/:id/variants/:variantId
 * @desc    Get a specific variant by ID
 * @access  Public (Anyone can view variant details)
 * @params  id - Listing ID, variantId - Variant subdocument ID
 * @returns Single variant data
 * @note    Public endpoint for viewing specific variant
 */
router.get(
  "/:id/variants/:variantId",
  validateListingIdParam,
  validateVariantIdParam,
  handleGetVariant
);

/**
 * @route   POST /api/listings/:id/variants
 * @desc    Add a new variant to a listing
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID
 * @body    name, sku (optional), price, stock (for products), attributes (optional), images (optional)
 * @returns Updated listing with new variant
 * @note    Ownership verified by isListingOwner middleware
 */
router.post(
  "/:id/variants",
  isListingOwner("id"),
  validateAddVariant,
  handleAddVariant
);

/**
 * @route   PUT /api/listings/:id/variants/:variantId
 * @desc    Update an existing variant
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID, variantId - Variant subdocument ID
 * @body    Fields to update (name, sku, price, stock, attributes, images, isAvailable)
 * @returns Updated listing with modified variant
 * @note    Ownership verified by isListingOwner middleware
 */
router.put(
  "/:id/variants/:variantId",
  isListingOwner("id"),
  validateUpdateVariant,
  handleUpdateVariant
);

/**
 * @route   DELETE /api/listings/:id/variants/:variantId
 * @desc    Remove a variant from a listing
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID, variantId - Variant subdocument ID
 * @returns Updated listing without the deleted variant
 * @note    Ownership verified by isListingOwner middleware
 */
router.delete(
  "/:id/variants/:variantId",
  isListingOwner("id"),
  validateListingIdParam,
  validateVariantIdParam,
  handleDeleteVariant
);

module.exports = router;
