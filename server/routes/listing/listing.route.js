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
} = require("../../controllers/listing/listing.controller");
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
} = require("../../middleware/validations/listing/listing.validation");

/**
 * Listing Routes
 *
 * PURPOSE: Handle marketplace listing operations and management
 * SCOPE: Listing CRUD, seller management, public browsing, availability control
 * AUTHENTICATION: Mixed - public browsing, protected creation/modification
 * AUTHORIZATION: Role-based (merchant/admin for creation), ownership-based for modifications
 *
 * ROUTE STRUCTURE:
 * - /api/listings (public listing browsing and merchant listing creation)
 * - /api/listings/:id (individual listing operations)
 * - /api/listings/my-listings (current user's listings)
 * - /api/listings/seller/:sellerId (public seller listings)
 */

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/listings
 * @desc    Get all public listings with pagination and filtering
 * @access  Public
 * @query   page, limit, sort, type, category, fields
 * @returns Paginated public listings (available only)
 * @note    Only shows available listings for public access
 */
router.get("/", validateGetListings, validatePagination, handleGetAllListings);

/**
 * @route   GET /api/listings/seller/:sellerId
 * @desc    Get public seller listings with pagination and filtering
 * @access  Public
 * @params  sellerId - Seller user ID
 * @query   page, limit, sort, type, category, fields
 * @returns Paginated seller listings (available only)
 * @note    Only shows available listings for public access
 */
router.get(
  "/seller/:sellerId",
  validateSellerIdParam,
  validateGetListings,
  validatePagination,
  handleGetSellerListings
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
 * @params  id - Listing ID
 * @query   includeSeller (boolean), fields (comma-separated)
 * @returns Listing data with optional seller information
 * @note    Must come AFTER /seller/:sellerId and /my-listings to avoid route conflict
 * @note    Public access allows guest browsing, but owners see enhanced details
 */
router.get("/:id", validateGetListing, handleGetListing);

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(protect);

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private (Merchant only)
 * @body    name, description, price, category, type, images, etc.
 * @returns Created listing data
 * @note    Requires merchant role or admin permissions
 */
router.post(
  "/",
  authorize("merchant"),
  validateCreateListing,
  handleCreateListing
);

// ==================== OWNERSHIP-PROTECTED ROUTES ====================

/**
 * @route   PATCH /api/listings/:id
 * @desc    Update existing listing
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID
 * @body    Fields to update (name, description, price, etc.)
 * @returns Updated listing data
 * @note    Ownership verified by isListingOwner middleware
 */
router.patch(
  "/:id",
  isListingOwner("id"),
  validateUpdateListing,
  handleUpdateListing
);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Soft delete listing by marking as unavailable
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID
 * @returns Success confirmation
 * @note    Performs soft delete, ownership verified by middleware
 */
router.delete(
  "/:id",
  isListingOwner("id"),
  validateListingIdParam,
  handleDeleteListing
);

/**
 * @route   PATCH /api/listings/:id/toggle
 * @desc    Toggle listing availability between active and inactive
 * @access  Private (Owner/Admin only)
 * @params  id - Listing ID
 * @returns Updated availability status
 * @note    Ownership verified by isListingOwner middleware
 */
router.patch(
  "/toggle-availability/:id",
  isListingOwner("id"),
  validateListingIdParam,
  handleToggleAvailability
);

module.exports = router;
