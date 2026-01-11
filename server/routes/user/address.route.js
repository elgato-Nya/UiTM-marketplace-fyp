const express = require("express");

const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} = require("../../controllers/user");
const {
  validateCreateAddress,
  validateUpdateAddress,
  validateDeleteAddress,
} = require("../../middleware/validations/user/address.validation");
const { protect } = require("../../middleware/auth/auth.middleware");
const { standardLimiter } = require("../../middleware/limiters.middleware");

/**
 * Address Management Routes
 *
 * PURPOSE: Handle user address CRUD operations for delivery and billing
 * SCOPE: Campus and personal address management, default address handling
 * AUTHENTICATION: All routes require authentication
 * VALIDATION: Address data validated for type-specific requirements
 * RATE LIMITING: standardLimiter (100 requests per 15 minutes)
 *
 * ROUTE STRUCTURE:
 * - /api/addresses/ (address collection operations)
 * - /api/addresses/:addressId (individual address operations)
 * - /api/addresses/default (default address management)
 *
 * ADDRESS TYPES:
 * - Campus: UiTM campus locations (building, floor, room)
 * - Personal: Home/external addresses (full postal address)
 *
 * BUSINESS RULES:
 * - Max 5 addresses per type per user
 * - One default address per user
 * - Campus addresses validated against UiTM campus enum
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and rate limiting middleware to all routes
router.use(protect);
router.use(standardLimiter);

/**
 * @route   GET /api/addresses?type=campus|personal
 * @desc    Get all addresses for current user
 * @access  Private
 * @returns Array of user addresses (campus and personal)
 */
router.get("/", getAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Add new address for current user
 * @access  Private
 * @body    type, recipientName, phoneNumber, campusAddress/personalAddress
 * @rules   Max 5 addresses per type, validates address type requirements
 */
router.post("/", validateCreateAddress, addAddress);

/**
 * @route   PATCH /api/addresses/:addressId
 * @desc    Update specific address for current user
 * @access  Private
 * @param   addressId - MongoDB ObjectId of the address to update
 * @body    Partial address data to update
 */
router.patch("/:addressId", validateUpdateAddress, updateAddress);

/**
 * @route   DELETE /api/addresses/:addressId
 * @desc    Delete specific address for current user
 * @access  Private
 * @param   addressId - MongoDB ObjectId of the address to delete
 * @note    Cannot delete if it's the only address or default address in use
 */
router.delete("/:addressId", validateDeleteAddress, deleteAddress);

/**
 * @route   PATCH /api/addresses/:addressId/default
 * @desc    Set specific address as default for current user
 * @access  Private
 */
router.patch("/:addressId/default", setDefaultAddress);

/**
 * @route   GET /api/addresses/default
 * @desc    Get current user's default address
 * @access  Private
 * @query   type - Optional address type filter (campus or personal)
 * @returns Default address object or null if none set
 */
router.get("/default", getDefaultAddress);

module.exports = router;
