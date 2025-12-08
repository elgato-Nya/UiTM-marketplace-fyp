const { User, Cart } = require("../../models");
const Listing = require("../../models/listing/listing.model");
const { CheckoutSession } = require("../../models/checkout");
const { createOrder } = require("../order/order.service");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createValidationError } = require("../../utils/errors");
const logger = require("../../utils/logger");

/**
 * Checkout Order Service
 *
 * PURPOSE: Handle order creation from checkout session
 * PATTERN: Follows your service pattern with proper error handling
 * SCOPE: Order creation, cart cleanup, checkout confirmation
 */

/**
 * Confirm checkout and create orders
 * @param {ObjectId} sessionId - Session ID
 * @param {ObjectId} userId - User ID
 * @returns {Object} { success: true, orders: [] }
 */
const confirmCheckoutAndCreateOrders = async (sessionId, userId) => {
  try {
    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      handleNotFoundError(
        "Checkout session",
        "SESSION_NOT_FOUND",
        "confirm_checkout",
        { sessionId, userId }
      );
    }

    if (session.isExpired) {
      createValidationError(
        "Checkout session has expired",
        { sessionId },
        "SESSION_EXPIRED"
      );
    }

    if (!session.deliveryMethod || !session.deliveryAddress) {
      createValidationError(
        "Delivery details are required",
        { sessionId },
        "MISSING_DELIVERY_DETAILS"
      );
    }

    if (!session.paymentMethod) {
      createValidationError(
        "Payment method is required",
        { sessionId },
        "MISSING_PAYMENT_METHOD"
      );
    }

    // For Stripe payments, verify payment intent exists
    if (session.paymentMethod === "credit_card") {
      if (!session.stripePaymentIntentId) {
        createValidationError(
          "Payment intent not created",
          { sessionId },
          "PAYMENT_INTENT_REQUIRED"
        );
      }
      // Note: Actual payment confirmation happens via webhook
      // This confirms the order creation is ready
    }

    // Create orders (one per seller)
    const { createdOrders, failedOrders } = await createOrdersFromSession(
      session,
      userId
    );

    if (createdOrders.length === 0) {
      const errorDetails = {
        sessionId,
        sellerCount: session.sellerGroups.length,
        failedCount: failedOrders.length,
      };

      if (failedOrders.length > 0) {
        errorDetails.failures = failedOrders;
      }

      createValidationError(
        "Failed to create orders. Please check if all items are still available and your delivery address is complete.",
        errorDetails,
        "ORDER_CREATION_FAILED"
      );
    }

    // Mark session as completed
    session.markCompleted(createdOrders.map((order) => order._id));
    await session.save();

    // Clear cart items if this was a cart checkout
    if (session.sessionType === "cart") {
      await clearCartAfterCheckout(userId, session.items);
    }

    logger.info("Checkout confirmed and orders created", {
      sessionId: session._id,
      userId,
      orderCount: createdOrders.length,
      orderIds: createdOrders.map((o) => o._id),
      totalAmount: session.pricing.totalAmount,
      paymentMethod: session.paymentMethod,
      action: "confirm_checkout",
    });

    return {
      success: true,
      orders: createdOrders,
      orderIds: createdOrders.map((o) => o._id),
    };
  } catch (error) {
    return handleServiceError(error, "confirmCheckoutAndCreateOrders", {
      sessionId,
      userId,
    });
  }
};

/**
 * Create orders from checkout session (one per seller)
 * @param {CheckoutSession} session - Checkout session
 * @param {ObjectId} userId - User ID
 * @returns {Array} Created orders
 */
const createOrdersFromSession = async (session, userId) => {
  const createdOrders = [];
  const failedOrders = [];

  for (const sellerGroup of session.sellerGroups) {
    try {
      // Prepare order data
      const orderData = {
        items: sellerGroup.items.map((item) => ({
          listingId: item.listingId.toString(),
          quantity: item.quantity,
        })),
        deliveryAddress: session.deliveryAddress,
        deliveryMethod: session.deliveryMethod,
        paymentMethod: session.paymentMethod,
      };

      // Create order using existing order service
      const order = await createOrder(userId, orderData);

      // Check if order creation returned an error object
      if (order && order.error) {
        logger.error("Order creation returned error", {
          sessionId: session._id,
          sellerId: sellerGroup.sellerId,
          errorCode: order.error.code,
          errorMessage: order.error.message,
          errorDetails: order.error.details,
        });
        failedOrders.push({
          sellerId: sellerGroup.sellerId,
          error: order.error.message,
        });
        continue;
      }

      if (order && order._id) {
        createdOrders.push(order);

        // Note: Stock deduction is already handled by createOrder service
        logger.info("Order created from checkout session", {
          orderId: order._id,
          sessionId: session._id,
          sellerId: sellerGroup.sellerId,
          itemCount: sellerGroup.items.length,
          totalAmount: sellerGroup.totalAmount,
        });
      } else {
        logger.error("Order creation returned unexpected result", {
          sessionId: session._id,
          sellerId: sellerGroup.sellerId,
          orderResult: order,
        });
        failedOrders.push({
          sellerId: sellerGroup.sellerId,
          error: "Unexpected order creation result",
        });
      }
    } catch (error) {
      logger.error("Failed to create order for seller group", {
        sessionId: session._id,
        sellerId: sellerGroup.sellerId,
        error: error.message,
        stack: error.stack,
      });
      failedOrders.push({
        sellerId: sellerGroup.sellerId,
        error: error.message,
      });
      // Continue with other sellers even if one fails
    }
  }

  // Log summary
  if (failedOrders.length > 0) {
    logger.warn("Some orders failed to create", {
      sessionId: session._id,
      successCount: createdOrders.length,
      failedCount: failedOrders.length,
      failedOrders,
    });
  }

  return { createdOrders, failedOrders };
};

/**
 * Clear cart items after successful checkout
 * @param {ObjectId} userId - User ID
 * @param {Array} checkoutItems - Items that were checked out
 */
const clearCartAfterCheckout = async (userId, checkoutItems) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return;
    }

    // TODO: [SELECTED CHECKOUT] Only remove selected items
    // For now, remove all items that were in the checkout
    const checkoutListingIds = checkoutItems.map((item) =>
      item.listingId.toString()
    );

    cart.items = cart.items.filter(
      (item) => !checkoutListingIds.includes(item.listing.toString())
    );

    await cart.save();

    logger.info("Cart cleared after checkout", {
      userId,
      removedItemCount: checkoutListingIds.length,
      remainingItemCount: cart.items.length,
      action: "clear_cart_after_checkout",
    });
  } catch (error) {
    logger.error("Failed to clear cart after checkout", {
      userId,
      error: error.message,
    });
    // Don't throw error - cart clearing failure shouldn't fail checkout
  }
};

module.exports = {
  confirmCheckoutAndCreateOrders,
  createOrdersFromSession,
  clearCartAfterCheckout,
};
