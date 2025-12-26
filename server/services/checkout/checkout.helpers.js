const { calculateFeeBreakdown } = require("../../config/stripe.config");
const { calcDeliveryFee } = require("../order/order.helpers");
const Listing = require("../../models/listing/listing.model");
const logger = require("../../utils/logger");

/**
 * Checkout Helper Functions
 *
 * PURPOSE: Reusable utility functions for checkout operations
 * FEATURES: Validation, grouping, calculations, stock management
 * PATTERN: Pure functions, no database writes
 */

/**
 * Validate items availability and stock
 * @param {Array} items - Array of {listingId, quantity}
 * @returns {Object} { valid: boolean, validatedItems: [], errors: [] }
 */
const validateCheckoutItems = async (items) => {
  const errors = [];
  const validatedItems = [];

  if (!items || items.length === 0) {
    return {
      valid: false,
      validatedItems: [],
      errors: ["No items provided for checkout"],
    };
  }

  // Get all listings
  const listingIds = items.map((item) => item.listingId);
  const listings = await Listing.find({
    _id: { $in: listingIds },
  }).populate("seller.userId", "email profile.username");

  // Create a map for quick lookup
  const listingMap = new Map();
  listings.forEach((listing) => {
    listingMap.set(listing._id.toString(), listing);
  });

  // Validate each item
  for (const item of items) {
    const listingId = item.listingId.toString();
    const listing = listingMap.get(listingId);

    if (!listing) {
      errors.push(`Listing ${listingId} not found`);
      continue;
    }

    if (!listing.isAvailable) {
      errors.push(`${listing.name} is no longer available`);
      continue;
    }

    // Check stock for products
    if (listing.type === "product") {
      if (listing.stock < item.quantity) {
        errors.push(
          `${listing.name} has insufficient stock. Available: ${listing.stock}, Requested: ${item.quantity}`
        );
        continue;
      }
    }

    // Item is valid
    validatedItems.push({
      listingId: listing._id,
      name: listing.name,
      price: listing.price,
      quantity: item.quantity,
      type: listing.type,
      stock: listing.stock,
      images: listing.images,
      sellerId: listing.seller.userId._id,
      sellerName: listing.seller.username,
      itemTotal: listing.price * item.quantity,
      listing: listing, // Keep reference for further processing
    });
  }

  return {
    valid: errors.length === 0,
    validatedItems,
    errors,
  };
};

/**
 * Group items by seller
 * @param {Array} validatedItems - Validated items with seller info
 * @param {String} deliveryMethod - Delivery method for fee calculation
 * @param {String} paymentMethod - Payment method (affects fees)
 * @returns {Promise<Array>} Array of seller groups with pricing
 */
const groupItemsBySeller = async (
  validatedItems,
  deliveryMethod,
  paymentMethod
) => {
  const sellerMap = new Map();

  // Group items by seller
  validatedItems.forEach((item) => {
    const sellerId = item.sellerId.toString();

    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, {
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        sellerEmail: item.listing?.seller?.userId?.email || "",
        items: [],
        subtotal: 0,
      });
    }

    const group = sellerMap.get(sellerId);
    group.items.push({
      listingId: item.listingId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: item.type,
      stock: item.stock,
      images: item.images,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      itemTotal: item.itemTotal,
    });
    group.subtotal += item.itemTotal;
  });

  // Calculate fees for each seller group (async)
  const sellerGroupsPromises = Array.from(sellerMap.values()).map(
    async (group) => {
      // Calculate delivery fee with merchant-specific settings
      const deliveryFee = await calcDeliveryFee(
        deliveryMethod,
        group.sellerId,
        group.subtotal
      );

      // Calculate platform and Stripe fees
      const feeBreakdown = calculateFeeBreakdown(group.subtotal, deliveryFee);

      const platformFee = feeBreakdown.platformFee;
      const stripeFee = paymentMethod === "cod" ? 0 : feeBreakdown.stripeFee;
      const totalAmount = group.subtotal + deliveryFee;
      const sellerReceives = totalAmount - platformFee - stripeFee;

      return {
        ...group,
        deliveryFee,
        platformFee,
        stripeFee,
        totalAmount,
        sellerReceives: Math.max(0, sellerReceives),
      };
    }
  );

  const sellerGroups = await Promise.all(sellerGroupsPromises);

  return sellerGroups;
};

/**
 * Calculate overall checkout summary
 * @param {Array} sellerGroups - Array of seller groups with pricing
 * @returns {Object} Overall pricing summary
 */
const calculateCheckoutSummary = (sellerGroups) => {
  const summary = {
    subtotal: 0,
    totalDeliveryFee: 0,
    totalPlatformFee: 0,
    totalStripeFee: 0,
    totalAmount: 0,
  };

  sellerGroups.forEach((group) => {
    summary.subtotal += group.subtotal;
    summary.totalDeliveryFee += group.deliveryFee;
    summary.totalPlatformFee += group.platformFee;
    summary.totalStripeFee += group.stripeFee;
    summary.totalAmount += group.totalAmount;
  });

  return summary;
};

/**
 * Reserve stock for items (virtual reservation)
 * @param {Array} items - Items to reserve
 * @returns {Array} Stock reservations
 */
const reserveStock = async (items) => {
  const reservations = [];

  for (const item of items) {
    // Only reserve stock for products, not services
    if (item.type === "product") {
      reservations.push({
        listingId: item.listingId,
        quantity: item.quantity,
        reservedAt: new Date(),
      });
    }
  }

  if (reservations.length > 0) {
    logger.info("Stock reserved for checkout session", {
      reservationCount: reservations.length,
      action: "stock_reserved",
    });
  }

  return reservations;
};

/**
 * Release stock reservations (virtual release)
 * @param {Array} reservations - Stock reservations to release
 */
const releaseStock = async (reservations) => {
  if (!reservations || reservations.length === 0) {
    return;
  }

  logger.info("Stock reservations released", {
    reservationCount: reservations.length,
    action: "stock_released",
  });

  // Note: This is a virtual reservation system
  // Actual stock deduction happens only on order creation
  // This function is here for future enhancement if needed
};

/**
 * Validate delivery address based on method
 * @param {String} deliveryMethod - Delivery method
 * @param {Object} deliveryAddress - Address object
 * @returns {Boolean} Is valid
 */
const validateDeliveryAddress = (deliveryMethod, deliveryAddress) => {
  if (!deliveryAddress) return false;

  const { AddressValidator } = require("../../validators/user");

  // Self-pickup and meetup require valid pickup details
  if (["self_pickup", "meetup"].includes(deliveryMethod)) {
    return (
      deliveryAddress.type === "pickup" &&
      deliveryAddress.pickupDetails &&
      AddressValidator.isValidPickupDetails(deliveryAddress.pickupDetails)
    );
  }

  // Campus delivery requires valid campus address
  if (["campus_delivery", "room_delivery"].includes(deliveryMethod)) {
    return (
      deliveryAddress.type === "campus" &&
      deliveryAddress.campusAddress &&
      AddressValidator.isValidCampusDetails(deliveryAddress.campusAddress)
    );
  }

  // Regular delivery requires valid personal address
  if (deliveryMethod === "delivery") {
    return (
      deliveryAddress.type === "personal" &&
      deliveryAddress.personalAddress &&
      AddressValidator.isValidPersonalDetails(deliveryAddress.personalAddress)
    );
  }

  return false;
};

/**
 * Check if payment method is allowed for amount
 * @param {String} paymentMethod - Payment method
 * @param {Number} totalAmount - Total amount
 * @returns {Object} { allowed: boolean, reason: string }
 */
const checkPaymentMethodAllowed = (paymentMethod, totalAmount) => {
  if (paymentMethod === "cod") {
    return { allowed: true, reason: null };
  }

  // For online payments, check minimum amount and Stripe availability
  const feeBreakdown = calculateFeeBreakdown(totalAmount, 0);

  if (!feeBreakdown.allowOnlinePayment) {
    const { stripeConfig } = require("../../config/stripe.config");
    return {
      allowed: false,
      reason: `Online payment requires minimum amount of RM ${stripeConfig.minimumAmount}`,
    };
  }

  return { allowed: true, reason: null };
};

/**
 * Validate campus delivery for all sellers
 * @param {Array} sellerGroups - Array of seller groups
 * @param {String} campusKey - Campus enum key
 * @returns {Promise<{valid: boolean, reason: string|null, invalidSellers: Array}>}
 */
const validateCampusDeliveryForSellers = async (sellerGroups, campusKey) => {
  if (!campusKey) {
    return { valid: false, reason: "Campus not specified", invalidSellers: [] };
  }

  const { validateCampusDelivery } = require("../order/order.helpers");
  const invalidSellers = [];

  for (const group of sellerGroups) {
    const validation = await validateCampusDelivery(group.sellerId, campusKey);

    if (!validation.valid) {
      invalidSellers.push({
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        reason: validation.reason,
      });
    }
  }

  if (invalidSellers.length > 0) {
    const sellerNames = invalidSellers.map((s) => s.sellerName).join(", ");
    return {
      valid: false,
      reason: `The following seller(s) do not deliver to this campus: ${sellerNames}`,
      invalidSellers,
    };
  }

  return { valid: true, reason: null, invalidSellers: [] };
};

module.exports = {
  validateCheckoutItems,
  groupItemsBySeller,
  calculateCheckoutSummary,
  reserveStock,
  releaseStock,
  validateDeliveryAddress,
  validateCampusDeliveryForSellers,
  checkPaymentMethodAllowed,
};
