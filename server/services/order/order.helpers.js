const { User } = require("../../models");
const logger = require("../../utils/logger");
const { DeliveryMethod, AddressType } = require("../../utils/enums/order.enum");

/**
 * PLATFORM DEFAULT DELIVERY FEES
 * Used as fallback when merchant hasn't set custom fees
 * Maps to AddressType enum for consistency
 */
const PLATFORM_DEFAULTS = {
  [AddressType.PERSONAL]: 5.0, // Home delivery
  [AddressType.CAMPUS]: 2.5, // Campus delivery
  [AddressType.PICKUP]: 1.0, // Self pickup
};

/**
 * Map DeliveryMethod enum to AddressType for fee calculation
 * This allows flexible delivery methods while standardizing fee categories
 */
const DELIVERY_METHOD_MAP = {
  [DeliveryMethod.DELIVERY]: AddressType.PERSONAL,
  [DeliveryMethod.CAMPUS_DELIVERY]: AddressType.CAMPUS,
  [DeliveryMethod.ROOM_DELIVERY]: AddressType.CAMPUS,
  [DeliveryMethod.SELF_PICKUP]: AddressType.PICKUP,
  [DeliveryMethod.MEETUP]: AddressType.PICKUP,
};

/**
 * Calculate delivery fee with merchant customization support
 *
 * @param {String} deliveryMethod - Delivery type from DeliveryMethod enum
 * @param {ObjectId} merchantId - Merchant user ID
 * @param {Number} orderTotal - Order subtotal for free threshold check
 * @returns {Promise<Number|null>} Delivery fee or null if disabled
 *
 */
const calculateDeliveryFee = async (
  deliveryMethod,
  merchantId,
  orderTotal = 0
) => {
  try {
    // Map delivery method to address type (fee category)
    const addressType = DELIVERY_METHOD_MAP[deliveryMethod];

    // Handle invalid delivery method
    if (!addressType) {
      logger.warn("Invalid delivery method", {
        deliveryMethod,
        validMethods: Object.keys(DELIVERY_METHOD_MAP),
        action: "calculate_delivery_fee",
      });
      return 0;
    }

    // Fetch merchant (with deliveryFees)
    const merchant = await User.findById(merchantId).select(
      "merchantDetails.deliveryFees"
    );

    // If merchant not found, fallback to platform defaults
    if (!merchant || !merchant.merchantDetails) {
      logger.warn("Merchant not found, using platform defaults", {
        merchantId,
        action: "calculate_delivery_fee",
      });
      return PLATFORM_DEFAULTS[addressType];
    }

    const deliveryFees = merchant.merchantDetails.deliveryFees;

    // Check if merchant offers free delivery for all orders
    if (deliveryFees?.freeDeliveryForAll) {
      return 0;
    }

    // Get fee config for this address type
    const feeConfig = deliveryFees?.[addressType];

    // If delivery type is disabled
    if (feeConfig && feeConfig.enabled === false) {
      logger.info("Delivery type disabled for merchant", {
        merchantId,
        deliveryMethod,
        addressType,
        action: "calculate_delivery_fee",
      });
      return null;
    }

    // Get the fee (custom or default)
    const fee = feeConfig?.fee ?? PLATFORM_DEFAULTS[addressType];

    // Check free delivery threshold
    if (feeConfig?.freeThreshold && orderTotal >= feeConfig.freeThreshold) {
      logger.info("Free delivery threshold met", {
        merchantId,
        orderTotal,
        threshold: feeConfig.freeThreshold,
        action: "calculate_delivery_fee",
      });
      return 0;
    }

    return fee;
  } catch (error) {
    logger.error("Error calculating delivery fee", {
      error: error.message,
      deliveryMethod,
      merchantId,
      orderTotal,
      action: "calculate_delivery_fee",
    });
    // Fallback to platform defaults on error
    const addressType = DELIVERY_METHOD_MAP[deliveryMethod];
    return PLATFORM_DEFAULTS[addressType] || 0;
  }
};

/**
 * Calculate estimated delivery date
 */
const calculateEstimatedDelivery = (deliveryMethod) => {
  const baseDays = {
    [DeliveryMethod.SELF_PICKUP]: 0,
    [DeliveryMethod.CAMPUS_DELIVERY]: 1,
    [DeliveryMethod.ROOM_DELIVERY]: 2,
    [DeliveryMethod.MEETUP]: 1,
    [DeliveryMethod.DELIVERY]: 3,
  };

  const days = baseDays[deliveryMethod] || 3;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);

  return estimatedDate;
};

/**
 * Validate campus delivery availability
 *
 * @param {ObjectId} merchantId - Merchant user ID
 * @param {String} campusKey - Campus enum key (e.g., "SHAH_ALAM")
 * @returns {Promise<{valid: boolean, reason: string|null}>} Validation result
 */
const validateCampusDelivery = async (merchantId, campusKey) => {
  try {
    if (!campusKey) {
      return { valid: false, reason: "Campus not specified" };
    }

    // Fetch merchant deliverable campuses
    const merchant = await User.findById(merchantId).select(
      "merchantDetails.deliverableCampuses merchantDetails.shopName"
    );

    if (!merchant || !merchant.merchantDetails) {
      logger.warn("Merchant not found for campus delivery validation", {
        merchantId,
        action: "validate_campus_delivery",
      });
      return { valid: false, reason: "Merchant not found" };
    }

    const { deliverableCampuses, shopName } = merchant.merchantDetails;

    // If no campuses configured, allow all campuses (backward compatibility)
    if (!deliverableCampuses || deliverableCampuses.length === 0) {
      logger.info(
        "Merchant has no campus restrictions, allowing all campuses",
        {
          merchantId,
          shopName,
          requestedCampus: campusKey,
          action: "validate_campus_delivery",
        }
      );
      return { valid: true, reason: null };
    }

    // Check if campus is in deliverable list
    const isDeliverable = deliverableCampuses.includes(campusKey);

    if (!isDeliverable) {
      logger.warn("Campus not in merchant's deliverable list", {
        merchantId,
        shopName,
        requestedCampus: campusKey,
        deliverableCampuses,
        action: "validate_campus_delivery",
      });
      return {
        valid: false,
        reason: `${
          shopName || "This merchant"
        } does not deliver to this campus`,
      };
    }

    return { valid: true, reason: null };
  } catch (error) {
    logger.error("Error validating campus delivery", {
      error: error.message,
      merchantId,
      campusKey,
      action: "validate_campus_delivery",
    });
    return { valid: false, reason: "Error validating campus delivery" };
  }
};

/**
 * Handle side effects when status changes
 */
// TODO: Implement actual side effects like notifications
const handleStatusSideEffects = async (order, newStatus) => {
  switch (newStatus) {
    case "shipped":
      // Could trigger shipping notifications
      break;
    case "delivered":
      // Could trigger delivery confirmations
      break;
    case "completed":
      // Could trigger review requests
      break;
    case "cancelled":
      // Stock restoration handled in cancelOrder
      break;
  }
};

module.exports = {
  calcDeliveryFee: calculateDeliveryFee,
  calculateDeliveryFee, // Export both names for flexibility
  calcEstimatedDelivery: calculateEstimatedDelivery,
  validateCampusDelivery,
  handleStatusSideEffects,
};
