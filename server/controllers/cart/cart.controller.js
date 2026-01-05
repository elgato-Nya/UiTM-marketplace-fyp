const BaseController = require("../base.controller");
const cartService = require("../../services/cart/cart.service");
const { sanitizeObject } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await cartService.getCartWithDetails(userId);

  baseController.logAction("get_cart", req, {
    userId: userId.toString(),
    itemCount: result.summary.totalItems,
  });

  return baseController.sendSuccess(res, result, "Cart retrieved successfully");
}, "get_cart");

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId, quantity, variantId } = sanitizeObject(req.body);

  const result = await cartService.addToCart(
    userId,
    listingId,
    quantity,
    variantId || null
  );

  baseController.logAction("add_to_cart", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
    variantId: variantId?.toString() || null,
    quantity,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Item added to cart successfully",
    201
  );
}, "add_to_cart");

const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId, variantId } = req.params;
  const { quantity } = sanitizeObject(req.body);

  const result = await cartService.updateCartItemQuantity(
    userId,
    listingId,
    quantity,
    variantId || null
  );

  baseController.logAction("update_cart_item", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
    variantId: variantId?.toString() || null,
    quantity,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Cart item updated successfully"
  );
}, "update_cart_item");

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId, variantId } = req.params;

  const result = await cartService.removeFromCart(
    userId,
    listingId,
    variantId || null
  );

  baseController.logAction("remove_from_cart", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
    variantId: variantId?.toString() || null,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Cart item removed successfully"
  );
}, "remove_from_cart");

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await cartService.clearCart(userId);

  baseController.logAction("clear_cart", req, {
    userId: userId.toString(),
    itemsCleared: result.summary.itemsCleared,
  });

  return baseController.sendSuccess(res, result, "Cart cleared successfully");
}, "clear_cart");

const moveToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId } = req.params;

  const result = await cartService.moveToWishlist(userId, listingId);

  baseController.logAction("move_to_wishlist", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Item moved to wishlist successfully"
  );
}, "move_to_wishlist");

const validateCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const validationResults = await cartService.validateCart(userId);

  baseController.logAction("validate_cart", req, {
    userId: userId.toString(),
    isValid: validationResults.isValid,
    errorCount: validationResults.errors.length,
  });

  const message = validationResults.isValid
    ? "Cart is valid for checkout"
    : "Cart validation failed";

  const statusCode = validationResults.isValid ? 200 : 400;

  return baseController.sendSuccess(
    res,
    { validation: validationResults },
    message,
    statusCode
  );
}, "validate_cart");

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  moveToWishlist,
  validateCart,
};
