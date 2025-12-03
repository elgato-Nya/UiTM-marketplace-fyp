const { Wishlist, Cart, Listing } = require("../../models");
const logger = require("../../utils/logger");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createBadRequestError } = require("../../utils/errors");
const { calculateWishlistSummary } = require("./wishlist.helpers");

const getWishlistWithDetails = async (userId) => {
  try {
    let wishlist = await Wishlist.getWishlistItemDetails(userId);

    // Auto-create wishlist if it doesn't exist
    if (!wishlist) {
      logger.info("Wishlist not found, creating new wishlist for user", {
        userId: userId.toString(),
      });
      wishlist = await Wishlist.findOrCreateWishlist(userId);
      // Fetch again with details after creation
      wishlist = await Wishlist.getWishlistItemDetails(userId);
    }

    const summary = calculateWishlistSummary(wishlist);

    return { wishlist, summary };
  } catch (error) {
    handleServiceError(error, "getWishlistWithDetails", {
      userId: userId.toString(),
    });
  }
};

const addToWishlist = async (userId, listingId) => {
  try {
    const listing = await Listing.findById(listingId).select(
      "name price isAvailable"
    );
    if (!listing) {
      handleNotFoundError("Listing", "LISTING_NOT_FOUND", "addToWishlist", {
        listingId: listingId.toString(),
      });
    }

    // Remove from cart if exists (prevent item in both cart and wishlist)
    try {
      const cart = await Cart.findOne({ userId });
      if (cart && cart.findItem(listingId)) {
        cart.removeItem(listingId);
        await cart.save();
        logger.info(
          `Removed listing ${listingId} from cart for user ${userId} after adding to wishlist.`
        );
      }
    } catch (cartError) {
      logger.error("Failed to remove item from cart", {
        userId: userId.toString(),
        listingId: listingId.toString(),
        error: cartError.message,
      });
      // Don't throw - we can still add to wishlist
    }

    // get or create wishlist
    const wishlist = await Wishlist.findOrCreateWishlist(userId);

    // add listing to wishlist
    wishlist.addItem(listingId, listing.price);
    await wishlist.save();

    return await getWishlistWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "addToWishlist", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

const removeFromWishlist = async (userId, listingId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      handleNotFoundError(
        "Wishlist",
        "WISHLIST_NOT_FOUND",
        "removeFromWishlist",
        {
          userId: userId.toString(),
        }
      );
    }

    wishlist.removeItem(listingId);
    await wishlist.save();

    return await getWishlistWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "removeFromWishlist", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

const clearWishlist = async (userId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      handleNotFoundError("Wishlist", "WISHLIST_NOT_FOUND", "clearWishlist", {
        userId: userId.toString(),
      });
    }
    const itemCount = wishlist.items.length;
    wishlist.clearWishlist();
    await wishlist.save();

    return {
      wishlist,
      summary: { totalItems: 0, itemsRemoved: itemCount },
    };
  } catch (error) {
    handleServiceError(error, "clearWishlist", {
      userId: userId.toString(),
    });
  }
};

const moveToCart = async (userId, listingId, quantity) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      handleNotFoundError("Wishlist", "WISHLIST_NOT_FOUND", "moveToCart", {
        userId: userId.toString(),
      });
    }

    // validate listing exists in wishlist and stock
    const listing = await Listing.findById(listingId).select(
      "stock isAvailable type"
    );
    if (!listing) {
      handleNotFoundError("Listing", "LISTING_NOT_FOUND", "moveToCart", {
        listingId: listingId.toString(),
      });
    }
    if (!listing.isAvailable) {
      throw createBadRequestError(
        "The listing is not available for purchase",
        "LISTING_UNAVAILABLE"
      );
    }

    // Only check stock for products, not services
    if (listing.type === "product" && listing.stock < 1) {
      throw createBadRequestError(
        "Insufficient stock to move listing to cart",
        "INSUFFICIENT_STOCK"
      );
    }

    wishlist.removeItem(listingId);
    await wishlist.save();

    // add to cart
    const cart = await Cart.findOrCreateCart(userId);
    cart.addOrUpdateItem(listingId, quantity);
    await cart.save();

    return await getWishlistWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "moveToCart", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

module.exports = {
  getWishlistWithDetails,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
};
