/**
 * Cart Service Helpers
 *
 * PURPOSE: Pure helper functions for cart calculations and transformations
 * PATTERN: Separated from service layer for better testability
 */

const findListingVariantById = (listing, variantId) => {
  if (!variantId || !listing?.variants) {
    return null;
  }

  if (typeof listing.variants.id === "function") {
    return listing.variants.id(variantId);
  }

  return listing.variants.find(
    (variant) => variant?._id?.toString() === variantId.toString()
  );
};

const resolveCartItemState = (item) => {
  const listing = item.listing;

  if (!listing) {
    return {
      isValid: false,
      isAvailable: false,
      stockAvailable: false,
      currentPrice: item.variantSnapshot?.price ?? null,
      currentStock: null,
      errors: ["This listing is no longer available"],
      unavailabilityType: "listing_missing",
    };
  }

  const isService = listing.type === "service";
  const hasVariant = item.variantId != null;
  let currentPrice = listing.price;
  let currentStock = isService ? null : listing.stock;
  let unavailabilityType = null;
  const errors = [];
  let stockAvailable = true;

  if (!listing.isAvailable) {
    errors.push(`${listing.name} is no longer available`);
    unavailabilityType = "listing_unavailable";
  }

  if (hasVariant) {
    const hasVariants =
      Array.isArray(listing.variants) && listing.variants.length > 0;

    if (!hasVariants) {
      errors.push(`${listing.name}: Selected variant is no longer available`);
      unavailabilityType = "variant_missing";
    } else {
      const variant = findListingVariantById(listing, item.variantId);

      if (!variant) {
        errors.push(`${listing.name}: Selected variant is no longer available`);
        unavailabilityType = "variant_missing";
      } else if (variant.isAvailable === false) {
        errors.push(
          `${listing.name}: Selected variant is no longer available`
        );
        unavailabilityType = "variant_unavailable";
      } else {
        currentPrice = item.variantSnapshot?.price ?? variant.price;
        currentStock = isService ? null : variant.stock;
      }
    }
  }

  if (!isService && errors.length === 0 && currentStock < item.quantity) {
    stockAvailable = false;
    errors.push(
      `${listing.name}: Only ${currentStock} available (requested: ${item.quantity})`
    );
  }

  return {
    isValid: errors.length === 0,
    isAvailable: listing.isAvailable && !unavailabilityType,
    stockAvailable,
    currentPrice,
    currentStock,
    errors,
    unavailabilityType,
  };
};

/**
 * Calculate comprehensive cart summary
 * @param {Object} cart - Cart document with populated items
 * @returns {Object} Summary statistics
 */
const calculateCartSummary = async (cart) => {
  const summary = {
    totalItems: cart.totalItems,
    totalItemsQuantity: cart.totalItemsQuantity,
    totalPrice: 0,
    unavailableCount: 0,
    outOfStockCount: 0,
    sellerCount: 0,
  };

  if (!cart.items || cart.items.length === 0) {
    return summary;
  }

  const sellers = new Set();

  cart.items.forEach((item) => {
    if (!item.listing) {
      summary.unavailableCount++;
      return;
    }

    const listing = item.listing;
    const isService = listing.type === "service";
    const itemState = resolveCartItemState(item);

    if (itemState.isValid) {
      if (isService) {
        summary.totalPrice += itemState.currentPrice;
        sellers.add(listing.seller.userId.toString());
      } else if (itemState.currentStock >= item.quantity) {
        summary.totalPrice += itemState.currentPrice * item.quantity;
        sellers.add(listing.seller.userId.toString());
      }
    }

    if (!itemState.isAvailable) {
      summary.unavailableCount++;
    }

    if (!isService && !itemState.stockAvailable) {
      summary.outOfStockCount++;
    }
  });

  summary.sellerCount = sellers.size;

  return summary;
};

/**
 * Group cart items by seller for multi-seller checkout
 * @param {Array} items - Cart items with populated listing data
 * @returns {Object} Grouped items by seller ID
 */
const groupCartItemsBySeller = (items) => {
  const sellerGroups = {};

  items.forEach((item) => {
    if (item.listing && item.listing.seller) {
      const sellerId = item.listing.seller.userId.toString();

      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          sellerId,
          sellerUsername: item.listing.seller.username,
          items: [],
          subtotal: 0,
        };
      }

      const itemState = resolveCartItemState(item);
      const itemSubtotal = itemState.currentPrice * item.quantity;

      sellerGroups[sellerId].items.push({
        listingId: item.listing._id,
        name: item.listing.name,
        price: itemState.currentPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      sellerGroups[sellerId].subtotal += itemSubtotal;
    }
  });

  return sellerGroups;
};

/**
 * Validate individual cart item
 * @param {Object} item - Cart item with populated listing
 * @returns {Object} Validation result
 */
const validateCartItem = (item) => {
  const listing = item.listing;
  const itemState = resolveCartItemState(item);

  const validation = {
    listingId: listing?._id || item.listing,
    name: listing?.name || "This listing",
    requestedQuantity: item.quantity,
    isAvailable: itemState.isAvailable,
    stockAvailable: itemState.stockAvailable,
    currentPrice: itemState.currentPrice,
    currentStock: itemState.currentStock,
    errors: [...itemState.errors],
    variantId: item.variantId || null,
  };

  if (!itemState.stockAvailable) {
    validation.availableStock = itemState.currentStock;
  }

  validation.isValid = validation.errors.length === 0;

  return validation;
};

/**
 * Build cart validation results
 * @param {Array} items - Cart items with populated listings
 * @returns {Object} Complete validation results
 */
const buildCartValidationResults = (items) => {
  const results = {
    isValid: true,
    validItems: [],
    unavailableItems: [],
    outOfStockItems: [],
    errors: [],
  };

  items.forEach((item) => {
    const validation = validateCartItem(item);

    if (validation.isValid) {
      results.validItems.push(validation);
    } else {
      results.isValid = false;
      results.errors.push(...validation.errors);

      if (!validation.isAvailable) {
        results.unavailableItems.push(validation);
      } else if (!validation.stockAvailable) {
        results.outOfStockItems.push(validation);
      }
    }
  });

  if (results.isValid) {
    results.sellerGroups = groupCartItemsBySeller(items);
    results.sellerCount = Object.keys(results.sellerGroups).length;
  }

  return results;
};

module.exports = {
  calculateCartSummary,
  groupCartItemsBySeller,
  validateCartItem,
  buildCartValidationResults,
};
