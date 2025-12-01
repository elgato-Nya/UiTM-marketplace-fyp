/**
 * Cart Service Helpers
 *
 * PURPOSE: Pure helper functions for cart calculations and transformations
 * PATTERN: Separated from service layer for better testability
 */

/**
 * Calculate comprehensive cart summary
 * @param {Object} cart - Cart document with populated items
 * @returns {Object} Summary statistics
 */
const calculateCartSummary = async (cart) => {
  const summary = {
    totalItems: cart.totalItems,
    totalItemsQuantity: cart.totalItemsQuantity, // Changed from totalQuantity
    totalPrice: 0, // Changed from subtotal
    unavailableCount: 0,
    outOfStockCount: 0,
    sellerCount: 0,
  };

  if (!cart.items || cart.items.length === 0) {
    return summary;
  }

  const sellers = new Set();

  cart.items.forEach((item) => {
    // Access the populated listing via 'listing' field, not 'listingId'
    if (item.listing) {
      const listing = item.listing;
      const isService = listing.type === "service";

      // Calculate total price
      // For services: always include with quantity=1 (no stock check)
      // For products: only if available and sufficient stock
      if (listing.isAvailable) {
        if (isService) {
          summary.totalPrice += listing.price * 1; // Services always quantity 1
          sellers.add(listing.seller.userId.toString());
        } else if (listing.stock >= item.quantity) {
          summary.totalPrice += listing.price * item.quantity;
          sellers.add(listing.seller.userId.toString());
        }
      }

      // Count unavailable items
      if (!listing.isAvailable) {
        summary.unavailableCount++;
      }

      // Count out-of-stock items (products only)
      if (!isService && listing.stock < item.quantity) {
        summary.outOfStockCount++;
      }
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
    // Access the populated listing via 'listing' field, not 'listingId'
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

      const itemSubtotal = item.listing.price * item.quantity;

      sellerGroups[sellerId].items.push({
        listingId: item.listing._id,
        name: item.listing.name,
        price: item.listing.price,
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
  // Access the populated listing via 'listing' field, not 'listingId'
  const listing = item.listing;
  const isService = listing.type === "service";

  const validation = {
    listingId: listing._id,
    name: listing.name,
    requestedQuantity: item.quantity,
    isAvailable: listing.isAvailable,
    stockAvailable: isService ? true : listing.stock >= item.quantity, // Services always have stock
    currentPrice: listing.price,
    currentStock: isService ? null : listing.stock, // Services don't have stock
    errors: [],
  };

  // Check availability
  if (!listing.isAvailable) {
    validation.errors.push(`${listing.name} is no longer available`);
  }

  // Check stock (products only)
  if (!isService && listing.stock < item.quantity) {
    validation.availableStock = listing.stock;
    validation.errors.push(
      `${listing.name}: Only ${listing.stock} available (requested: ${item.quantity})`
    );
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

  // Add seller grouping if all valid
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
