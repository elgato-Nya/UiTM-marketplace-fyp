const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
  moveToWishlist,
} = require("../../controllers/cart");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateMoveToWishlist,
} = require("../../middleware/validations/cart/cart.validation");

/**
 * Cart Routes
 *
 * PURPOSE: Handle shopping cart operations for authenticated users
 * SCOPE: Cart management, item manipulation, wishlist integration, checkout preparation
 * AUTHENTICATION: All routes require authentication (no guest cart)
 * AUTHORIZATION: Users can only access their own cart
 *
 * ROUTE STRUCTURE:
 * - /api/cart (cart retrieval and clearing)
 * - /api/cart/add (add items to cart)
 * - /api/cart/item/:listingId (item-specific operations)
 * - /api/cart/validate (pre-checkout validation)
 * - /api/cart/move-to-wishlist/:listingId (move to wishlist)
 *
 * BUSINESS RULES:
 * - Maximum 50 items per cart
 * - Quantity limited by available stock
 * - Unavailable items flagged but not removed
 * - Adding to cart removes from wishlist automatically
 * - Cart validation checks stock and availability before checkout
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart with full listing details
 * @access  Private
 * @returns Cart data with items, summary, and availability status
 * @note    Always returns latest price and stock information
 */
router.get("/", getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart or update quantity if exists
 * @access  Private
 * @body    { listingId: string, quantity: number }
 * @returns Updated cart with new item
 * @note    Removes item from wishlist if exists
 * @note    Validates stock availability before adding
 */
router.post("/", validateAddToCart, addToCart);

/**
 * @route   PATCH /api/cart/item/:listingId
 * @desc    Update cart item quantity
 * @access  Private
 * @params  listingId - Listing ID to update
 * @body    { quantity: number }
 * @returns Updated cart with modified quantity
 * @note    Validates new quantity doesn't exceed stock
 */
router.patch("/item/:listingId", validateUpdateCartItem, updateCartItem);

/**
 * @route   DELETE /api/cart/item/:listingId
 * @desc    Remove item from cart
 * @access  Private
 * @params  listingId - Cart item ID (preferred) or Listing ID (fallback)
 * @returns Updated cart without removed item
 * @note    Accepts item._id for null listings or listing._id for backwards compatibility
 */
router.delete("/item/:listingId", validateRemoveFromCart, removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 * @returns Empty cart with cleared item count
 * @note    Removes all items from cart at once
 */
router.delete("/", clearCart);

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart before checkout
 * @access  Private
 * @returns Validation results with stock/availability checks
 * @note    Groups items by seller for multi-seller checkout
 * @note    Identifies unavailable or out-of-stock items
 */
router.post("/validate", validateCart);

/**
 * @route   POST /api/cart/move-to-wishlist/:listingId
 * @desc    Move item from cart to wishlist
 * @access  Private
 * @params  listingId - Listing ID to move
 * @returns Updated cart and success message
 * @note    Removes from cart and adds to wishlist in single operation
 */
router.post(
  "/move-to-wishlist/:listingId",
  validateMoveToWishlist,
  moveToWishlist
);

module.exports = router;
