/**
 * Wishlist Service Helpers
 *
 * PURPOSE: Pure helper functions for wishlist calculations and transformations
 * PATTERN: Separated from service layer for better testability
 */

/**
 * Calculate wishlist summary with price tracking
 * @param {Object} wishlist - Wishlist document with populated items
 * @returns {Object} Summary statistics
 */
const calculateWishlistSummary = (wishlist) => {
  const summary = {
    totalItems: wishlist.totalItems,
    unavailableCount: 0,
    priceDropCount: 0,
    priceIncreaseCount: 0,
    priceSameCount: 0,
  };

  if (!wishlist.items || wishlist.items.length === 0) {
    return summary;
  }

  wishlist.items.forEach((item) => {
    if (item.listing) {
      const listing = item.listing;

      if (!listing.isAvailable) {
        summary.unavailableCount++;
      }

      if (listing.price < item.priceWhenAdded) {
        summary.priceDropCount++;
      } else if (listing.price > item.priceWhenAdded) {
        summary.priceIncreaseCount++;
      } else {
        summary.priceSameCount++;
      }
    }
  });
  return summary;
};

/**
 * Calculate price change for a wishlist item
 * @param {Number} currentPrice - Current listing price
 * @param {Number} originalPrice - Price when added to wishlist
 * @returns {Object} Price change details
 */
const calculatePriceChange = (currentPrice, originalPrice) => {
  const difference = currentPrice - originalPrice;
  const percentageChange =
    originalPrice > 0 ? ((difference / originalPrice) * 100).toFixed(2) : 0;

  return {
    currentPrice,
    originalPrice,
    difference,
    percentageChange: parseFloat(percentageChange),
    hasDropped: difference < 0,
    hasIncreased: difference > 0,
    isSame: difference === 0,
  };
};

/**
 * Build enhanced wishlist items with price tracking
 * @param {Array} items - Wishlist items with populated listings
 * @returns {Array} Enhanced items with price change info
 */
const buildEnhancedWishlistItems = (items) => {
  return items.map((item) => {
    const listing = item.listing;
    // Use priceWhenAdded from model (consistent field name)
    const priceWhenAdded = item.priceWhenAdded || 0;

    return {
      _id: item._id,
      listingId: listing._id,
      name: listing.name,
      currentPrice: listing.price,
      priceWhenAdded,
      priceChange: calculatePriceChange(listing.price, priceWhenAdded),
      stock: listing.stock,
      isAvailable: listing.isAvailable,
      images: listing.images,
      category: listing.category,
      seller: listing.seller,
      addedAt: item.addedAt,
    };
  });
};

module.exports = {
  calculateWishlistSummary,
  calculatePriceChange,
  buildEnhancedWishlistItems,
};
