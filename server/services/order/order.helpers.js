const { User } = require("../../models");
const logger = require("../../utils/logger");
const { DeliveryMethod, AddressType } = require("../../utils/enums/order.enum");
const payoutService = require("../payout");
const {
  createNotification,
} = require("../notification/notification.service");
const {
  NotificationType,
} = require("../../utils/enums/notification.enum");

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
  orderTotal = 0,
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
      "merchantDetails.deliveryFees",
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
      "merchantDetails.deliverableCampuses merchantDetails.shopName",
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
        },
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
 * Handle side effects when order status changes
 *
 * Updates merchant metrics when orders complete:
 * - Increments totalRevenue
 * - Increments totalSales
 */
const handleStatusSideEffects = async (order, newStatus) => {
  try {
    switch (newStatus) {
      case "shipped":
        logger.info("Order shipped", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          action: "status_side_effect",
        });
        // Notify buyer that order has been shipped
        createNotification({
          userId: order.buyer.userId,
          type: NotificationType.ORDER_SHIPPED,
          title: "Order Shipped! 🚚",
          message: `Your order #${order.orderNumber} has been shipped by ${order.seller.name}`,
          data: {
            referenceId: order._id,
            referenceModel: "Order",
            actionUrl: `/orders/${order._id}`,
            extra: { orderNumber: order.orderNumber },
          },
        }).catch((err) => logger.error("Failed to send shipped notification", { error: err.message }));
        break;

      case "delivered":
        logger.info("Order delivered", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          action: "status_side_effect",
        });
        // Notify buyer that order was delivered (EMAIL + In-App - critical)
        createNotification({
          userId: order.buyer.userId,
          type: NotificationType.ORDER_DELIVERED,
          title: "Order Delivered! ✅",
          message: `Your order #${order.orderNumber} has been delivered. Enjoy your purchase!`,
          data: {
            referenceId: order._id,
            referenceModel: "Order",
            actionUrl: `/orders/${order._id}`,
            extra: { orderNumber: order.orderNumber },
          },
        }).catch((err) => logger.error("Failed to send delivery notification", { error: err.message }));
        break;

      case "completed":
        // Update merchant revenue and sales metrics
        const sellerId = order.seller?.userId;
        if (sellerId) {
          const orderTotal = order.totalAmount || 0;
          const platformFeeRate = 0.05; // 5% platform fee

          // Add earnings to seller balance (payout system)
          try {
            await payoutService.addEarnings(
              sellerId,
              order._id,
              order.orderNumber,
              orderTotal,
              platformFeeRate,
            );
            logger.info("Seller earnings added to balance", {
              orderId: order._id,
              orderNumber: order.orderNumber,
              sellerId: sellerId.toString(),
              grossAmount: orderTotal,
              platformFeeRate,
              netAmount: orderTotal * (1 - platformFeeRate),
              action: "status_side_effect",
            });

            // Notify seller that earnings have been credited
            createNotification({
              userId: sellerId,
              type: NotificationType.PAYOUT_PROCESSED,
              title: "Earnings Credited 💳",
              message: `RM ${(orderTotal * (1 - platformFeeRate)).toFixed(2)} credited from order #${order.orderNumber}`,
              data: {
                referenceId: order._id,
                referenceModel: "Order",
                actionUrl: `/merchant/dashboard`,
                extra: { orderNumber: order.orderNumber, net: orderTotal * (1 - platformFeeRate) },
              },
            }).catch((err) => logger.error("Failed to send earnings notification", { error: err.message }));
          } catch (earningsError) {
            logger.error("Failed to add earnings to seller balance", {
              orderId: order._id,
              sellerId: sellerId.toString(),
              error: earningsError.message,
              action: "status_side_effect",
            });
          }

          // Update merchant shop metrics
          const seller = await User.findById(sellerId);
          if (seller && seller.merchantDetails?.shopMetrics) {
            const itemsSold =
              order.items?.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0,
              ) || 0;

            // Increment revenue and sales
            seller.merchantDetails.shopMetrics.totalRevenue =
              (seller.merchantDetails.shopMetrics.totalRevenue || 0) +
              orderTotal;
            seller.merchantDetails.shopMetrics.totalSales =
              (seller.merchantDetails.shopMetrics.totalSales || 0) + itemsSold;

            await seller.save();

            logger.info("Merchant metrics updated on order completion", {
              orderId: order._id,
              orderNumber: order.orderNumber,
              sellerId: sellerId.toString(),
              revenueAdded: orderTotal,
              itemsSold,
              newTotalRevenue: seller.merchantDetails.shopMetrics.totalRevenue,
              newTotalSales: seller.merchantDetails.shopMetrics.totalSales,
              action: "status_side_effect",
            });
          }
        }
        break;

      case "cancelled":
        // Stock restoration handled in cancelOrder
        logger.info("Order cancelled", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          action: "status_side_effect",
        });
        break;
    }
  } catch (error) {
    // Log error but don't fail the status update
    logger.error("Error in status side effects", {
      orderId: order._id,
      newStatus,
      error: error.message,
      action: "status_side_effect",
    });
  }
};

module.exports = {
  calcDeliveryFee: calculateDeliveryFee,
  calculateDeliveryFee, // Export both names for flexibility
  calcEstimatedDelivery: calculateEstimatedDelivery,
  validateCampusDelivery,
  handleStatusSideEffects,
};
