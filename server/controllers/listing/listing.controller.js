const BaseController = require("../base.controller");
const {
  createListing,
  getListingById,
  getAllListings,
  getSellerListings,
  updateListing,
  deleteListing,
  toggleAvailability,
} = require("../../services/listing/listing.service");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Listing Controller - Function-based approach with BaseController utilities
 *
 * PURPOSE: Handle listing operations for e-commerce marketplace
 * PATTERN: Functions + BaseController helpers (Industry Standard for Express)
 * FEATURES:
 * - Listing CRUD operations
 * - Seller-specific listing management
 * - Availability toggling
 * - Consistent response formatting
 * - Action logging and error handling
 */

const baseController = new BaseController();

/**
 * PURPOSE: Create a new listing for authenticated merchant
 * @function handleCreateListing
 * @returns {Promise<void>} Sends response with created listing
 * @note Requires merchant role, validates listing data
 */
const handleCreateListing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sanitizedListing = sanitizeObject(req.body);

  if (req.body.isFree === true) {
    req.body.price = 0;
  }

  const listing = await createListing(userId, sanitizedListing);

  baseController.logAction("create_listing", req, {
    sellerId: userId,
    listingId: listing._id,
    listingName: listing.name,
    listingType: listing.type,
    listingCategory: listing.category,
  });

  return baseController.sendSuccess(
    res,
    { listing },
    "Listing created successfully",
    201
  );
}, "create_listing");

/**
 * PURPOSE: Get listing by ID with optional seller details
 * @function handleGetListing
 * @returns {Promise<void>} Sends response with listing data
 * @note Public endpoint, supports query options for fields and seller info
 */
const handleGetListing = asyncHandler(async (req, res) => {
  const { id: listingId } = req.params;
  const { includeSeller, fields } = sanitizeQuery(req.query);

  const options = {
    includeSeller: includeSeller === "true",
    fields: fields || "",
  };

  const listing = await getListingById(listingId, options);

  return baseController.sendSuccess(
    res,
    { listing },
    "Listing retrieved successfully"
  );
}, "get_listing");

/**
 * PURPOSE: Update existing listing with ownership verification
 * @function handleUpdateListing
 * @returns {Promise<void>} Sends response with updated listing
 * @note Requires ownership via isListingOwner middleware
 */
const handleUpdateListing = asyncHandler(async (req, res) => {
  const { id: listingId } = req.params;
  const userId = req.user._id;

  // TODO: implement this
  // if (updates.isFree === true) {
  // updates.price = 0;
  // }

  const updateDTO = {};
  const allowedFields = [
    "name",
    "description",
    "price",
    "stock",
    "category",
    "images",
    "type",
    "isFree",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateDTO[field] = req.body[field];
    }
  });

  const sanitizedUpdateData = sanitizeObject(updateDTO);

  const updatedListing = await updateListing(
    listingId,
    userId,
    sanitizedUpdateData
  );

  baseController.logAction("update_listing", req, {
    userId: userId,
    listingId: listingId,
    updatedFields: Object.keys(sanitizedUpdateData),
  });

  return baseController.sendSuccess(
    res,
    { updatedListing },
    "Listing updated successfully"
  );
}, "update_listing");

/**
 * PURPOSE: Delete listing (soft or permanent)
 * @function handleDeleteListing
 * @returns {Promise<void>} Sends response confirming deletion
 * @note Requires ownership via isListingOwner middleware, supports both soft and permanent delete
 */
const handleDeleteListing = asyncHandler(async (req, res) => {
  const { id: listingId } = req.params;
  const userId = req.user._id;
  const { permanent } = sanitizeQuery(req.query);
  const isPermanent = permanent === "true";

  const result = await deleteListing(listingId, userId, isPermanent);

  baseController.logAction(
    isPermanent ? "permanent_delete_listing" : "soft_delete_listing",
    req,
    {
      listingId: listingId.toString(),
      userId: userId.toString(),
      isPermanent,
    }
  );

  return baseController.sendSuccess(
    res,
    { success: true, isPermanent, result, listingId: listingId.toString() },
    isPermanent
      ? "Listing permanently deleted"
      : "Listing marked as unavailable"
  );
}, "delete_listing");

/**
 * PURPOSE: Toggle listing availability between active and inactive
 * @function handleToggleAvailability
 * @returns {Promise<void>} Sends response with updated availability status
 * @note Requires ownership via isListingOwner middleware
 */
const handleToggleAvailability = asyncHandler(async (req, res) => {
  const { id: listingId } = req.params;
  const userId = req.user._id;

  const updatedListing = await toggleAvailability(listingId, userId);

  baseController.logAction("toggle_listing_availability", req, {
    listingId: listingId.toString(),
    userId: userId.toString(),
    newAvailability: updatedListing.isAvailable,
  });

  return baseController.sendSuccess(
    res,
    {
      _id: updatedListing._id.toString(),
      isAvailable: updatedListing.isAvailable,
      name: updatedListing.name,
    },
    `Listing ${
      updatedListing.isAvailable ? "activated" : "deactivated"
    } successfully`
  );
}, "toggle_listing_availability");

/**
 * PURPOSE: Get current user's listings with pagination and filtering
 * @function handleGetMyListings
 * @returns {Promise<void>} Sends response with user's listings and pagination
 * @note Private endpoint, supports query options for filtering and pagination
 */
const handleGetMyListings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 24,
    sort,
    includeUnavailable,
    type,
    category,
    fields,
    search,
  } = sanitizeQuery(req.query);

  // Build options object
  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100), // Cap at 100
    sort,
    includeUnavailable: includeUnavailable === "true", // Convert to boolean
    type,
    category,
    fields,
    search,
  };

  const result = await getSellerListings(userId, options);

  return baseController.sendSuccess(
    res,
    result,
    "Listings retrieved successfully"
  );
}, "get_my_listings");

/**
 * PURPOSE: Get public seller listings with pagination and filtering
 * @function handleGetSellerListings
 * @returns {Promise<void>} Sends response with seller's public listings
 * @note Public endpoint, only shows available listings, supports pagination
 */
const handleGetSellerListings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const {
    page = 1,
    limit = 24,
    sort,
    includeUnavailable,
    type,
    category,
    fields,
    search,
  } = sanitizeQuery(req.query);

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort,
    includeUnavailable: false, // Always false for public access
    type,
    category,
    fields,
    search,
  };

  const result = await getSellerListings(sellerId, options);

  return baseController.sendSuccess(
    res,
    result,
    "Seller listings retrieved successfully"
  );
}, "get_seller_listings");

/**
 * PURPOSE: Get all public listings with pagination and filtering
 * @function handleGetAllListings
 * @returns {Promise<void>} Sends response with all public listings
 * @note Public endpoint, only shows available listings
 */
const handleGetAllListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 24,
    sort,
    includeUnavailable,
    type,
    category,
    fields,
    search,
  } = sanitizeQuery(req.query);

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort,
    includeUnavailable: false, // Always false for public access
    type,
    category,
    fields,
    search,
  };

  const result = await getAllListings(options);

  return baseController.sendSuccess(
    res,
    result,
    "Listings retrieved successfully"
  );
}, "get_all_listings");

module.exports = {
  handleCreateListing,
  handleGetListing,
  handleGetAllListings,
  handleUpdateListing,
  handleDeleteListing,
  handleToggleAvailability,
  handleGetMyListings,
  handleGetSellerListings,
};
