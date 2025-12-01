const BaseController = require("../base.controller");
const wishlistService = require("../../services/wishlist/wishlist.service");
const { sanitizeObject } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wishlist = await wishlistService.getWishlistWithDetails(userId);

  baseController.logAction("get_wishlist", req, {
    userId: userId.toString(),
    itemCount: wishlist.summary.totalItems,
  });

  return baseController.sendSuccess(
    res,
    wishlist,
    "Wishlist retrieved successfully"
  );
}, "get_wishlist");

const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId } = sanitizeObject(req.body);

  const result = await wishlistService.addToWishlist(userId, listingId);

  baseController.logAction("add_to_wishlist", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Item added to wishlist successfully",
    201
  );
}, "add_to_wishlist");

const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId } = req.params;

  const result = await wishlistService.removeFromWishlist(userId, listingId);

  baseController.logAction("remove_from_wishlist", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Item removed from wishlist successfully"
  );
}, "remove_from_wishlist");

const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await wishlistService.clearWishlist(userId);

  baseController.logAction("clear_wishlist", req, {
    userId: userId.toString(),
    itemsRemoved: result.summary.itemsRemoved,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Wishlist cleared successfully"
  );
}, "clear_wishlist");

const moveToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId } = req.params;
  const { quantity = 1 } = sanitizeObject(req.body);

  const result = await wishlistService.moveToCart(userId, listingId, quantity);

  baseController.logAction("move_to_cart", req, {
    userId: userId.toString(),
    listingId: listingId.toString(),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Item moved to cart successfully"
  );
}, "move_to_cart");

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
};
