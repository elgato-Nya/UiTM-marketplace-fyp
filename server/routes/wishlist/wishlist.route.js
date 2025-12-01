const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} = require("../../controllers/wishlist");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  validateAddToWishlist,
  validateRemoveFromWishlist,
  validateMoveToCart,
} = require("../../middleware/validations/wishlist/wishlist.validation");

/**
 * Wishlist Routes
 *
 * PURPOSE: Handle wishlist/favorites operations for authenticated users
 * SCOPE: Wishlist management, item tracking, price monitoring, cart integration
 * AUTHENTICATION: All routes require authentication (no guest wishlist)
 * AUTHORIZATION: Users can only access their own wishlist
 *
 * ROUTE STRUCTURE:
 * - /api/wishlist (wishlist retrieval and clearing)
 * - /api/wishlist/add (add items to wishlist)
 * - /api/wishlist/item/:listingId (item-specific operations)
 * - /api/wishlist/move-to-cart/:listingId (move to cart)
 *
 * BUSINESS RULES:
 * - Maximum 250 items per wishlist
 * - Cannot add items already in cart
 * - Tracks original price for price drop notifications
 * - Unavailable items flagged but not removed
 * - Moving to cart removes from wishlist automatically
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist with full listing details
 * @access  Private
 * @returns Wishlist data with items, price changes, and summary
 * @note    Shows price drops/increases since item was added
 */
router.get("/", getWishlist);

/**
 * @route   POST /api/wishlist/add
 * @desc    Add item to wishlist
 * @access  Private
 * @body    { listingId: string }
 * @returns Updated wishlist with new item
 * @note    Stores current price for price tracking
 * @note    Prevents adding if item already in cart
 */
router.post("/add", validateAddToWishlist, addToWishlist);

/**
 * @route   DELETE /api/wishlist/item/:listingId
 * @desc    Remove item from wishlist
 * @access  Private
 * @params  listingId - Listing ID to remove
 * @returns Updated wishlist without removed item
 */
router.delete(
  "/item/:listingId",
  validateRemoveFromWishlist,
  removeFromWishlist
);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 * @returns Empty wishlist with cleared item count
 * @note    Removes all items from wishlist at once
 */
router.delete("/", clearWishlist);

/**
 * @route   POST /api/wishlist/move-to-cart/:listingId
 * @desc    Move item from wishlist to cart
 * @access  Private
 * @params  listingId - Listing ID to move
 * @returns Updated wishlist and success message
 * @note    Validates stock availability before moving
 * @note    Adds to cart with quantity of 1 by default
 */
router.post("/move-to-cart/:listingId", validateMoveToCart, moveToCart);

module.exports = router;
