const { Listing, Cart, Wishlist } = require("../../models");
const logger = require("../../utils/logger");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createBadRequestError } = require("../../utils/errors");
const { cartErrorMessages } = require("../../validators/cart/cart.validator");
const {
  calculateCartSummary,
  groupCartItemsBySeller,
  buildCartValidationResults,
} = require("./cart.helpers");

const getCartWithDetails = async (userId) => {
  try {
    let cart = await Cart.getCartWithDetails(userId);

    // Auto-create cart if it doesn't exist
    if (!cart) {
      logger.info("Cart not found, creating new cart for user", {
        userId: userId.toString(),
      });
      cart = await Cart.findOrCreateCart(userId);
      // Fetch again with details after creation
      cart = await Cart.getCartWithDetails(userId);
    }

    const summary = await calculateCartSummary(cart);

    return { cart, summary };
  } catch (error) {
    handleServiceError(error, "getCartWithDetails", {
      userId: userId.toString(),
    });
  }
};

const addToCart = async (userId, listingId, quantity) => {
  try {
    const listing = await Listing.findById(listingId).select(
      "name price stock isAvailable seller type"
    );

    if (!listing) {
      handleNotFoundError("listing", "LISTING_NOT_FOUND", "addToCart", {
        listingId: listingId.toString(),
        userId: userId.toString(),
      });
    }

    if (!listing.isAvailable) {
      throw createBadRequestError(
        cartErrorMessages.listing.unavailable,
        "LISTING_UNAVAILABLE"
      );
    }

    // Only check stock for products, not services
    if (listing.type === "product") {
      if (listing.stock < quantity) {
        throw createBadRequestError(
          `Only ${listing.stock} items available in stock`,
          "INSUFFICIENT_STOCK"
        );
      }
    }

    const cart = await Cart.findOrCreateCart(userId);

    const existingItem = cart.findItem(listingId);
    const totalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // Only check stock limits for products
    if (listing.type === "product" && totalQuantity > listing.stock) {
      throw createBadRequestError(
        `Cannot add ${quantity} more. Only ${
          listing.stock - (existingItem?.quantity || 0)
        } items available`,
        "QUANTITY_EXCEEDS_STOCK"
      );
    }

    cart.addOrUpdateItem(listingId, quantity);
    await cart.save();

    // remove from wishlist if exists
    try {
      const wishlist = await Wishlist.findOne({ userId });
      if (wishlist) {
        wishlist.removeItem(listingId);
        await wishlist.save();
        logger.info(
          `Removed listing ${listingId} from wishlist for user ${userId} after adding to cart.`
        );
      }
    } catch (wishlistError) {
      logger.error("Failed to remove item from wishlist", {
        userId: userId.toString(),
        listingId: listingId.toString(),
        error: wishlistError.message,
      });
    }

    return await getCartWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "addToCart", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

const updateCartItemQuantity = async (userId, listingId, quantity) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      handleNotFoundError("Cart", "CART_NOT_FOUND", "updateCartItemQuantity", {
        userId: userId.toString(),
      });
    }

    const listing = await Listing.findById(listingId).select(
      "stock isAvailable type"
    );
    if (!listing) {
      handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "updateCartItemQuantity",
        {
          listingId: listingId.toString(),
        }
      );
    }

    // Only check stock for products
    if (listing.type === "product" && quantity > listing.stock) {
      throw createBadRequestError(
        `Only ${listing.stock} items available in stock`,
        "INSUFFICIENT_STOCK"
      );
    }

    cart.updateItemQuantity(listingId, quantity);
    await cart.save();

    return await getCartWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "updateCartItemQuantity", {
      userId: userId.toString(),
      listingId: listingId.toString(),
      quantity,
    });
  }
};

const removeFromCart = async (userId, listingId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      handleNotFoundError("Cart", "CART_NOT_FOUND", "removeFromCart", {
        userId: userId.toString(),
      });
    }

    cart.removeItem(listingId);
    await cart.save();

    return await getCartWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "removeFromCart", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      handleNotFoundError("Cart", "CART_NOT_FOUND", "clearCart", {
        userId: userId.toString(),
      });
    }

    const itemCount = cart.items.length;
    cart.clearCart();
    await cart.save();

    return {
      cart,
      summary: {
        totalItems: 0,
        totalQuantity: 0,
        totalPrice: 0,
        itemsCleared: itemCount,
      },
    };
  } catch (error) {
    handleServiceError(error, "clearCart", {
      userId: userId.toString(),
    });
  }
};

// TODO: recheck whether to move it into middleware or validation/validator
const validateCart = async (userId) => {
  try {
    const cart = await Cart.getCartWithDetails(userId);

    if (!cart) {
      handleNotFoundError("Cart", "CART_NOT_FOUND", "validateCart", {
        userId: userId.toString(),
      });
    }

    const validationResults = buildCartValidationResults(cart.items);

    return validationResults;
  } catch (error) {
    handleServiceError(error, "validateCart", {
      userId: userId.toString(),
    });
  }
};

const moveToWishlist = async (userId, listingId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      handleNotFoundError("Cart", "CART_NOT_FOUND", "moveToWishlist", {
        userId: userId.toString(),
      });
    }

    const listing = await Listing.findById(listingId).select("price");
    if (!listing) {
      handleNotFoundError("Listing", "LISTING_NOT_FOUND", "moveToWishlist", {
        listingId: listingId.toString(),
      });
    }

    cart.removeItem(listingId);
    await cart.save();

    // Add to wishlist
    const wishlist = await Wishlist.findOrCreateWishlist(userId);
    wishlist.addItem(listingId, listing.price);
    await wishlist.save();

    return await getCartWithDetails(userId);
  } catch (error) {
    handleServiceError(error, "moveToWishlist", {
      userId: userId.toString(),
      listingId: listingId.toString(),
    });
  }
};

module.exports = {
  getCartWithDetails,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  validateCart,
  moveToWishlist,
};
