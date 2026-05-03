const mongoose = require("mongoose");
const { User, Cart, Order } = require("../../models");
const Listing = require("../../models/listing/listing.model");
const { CheckoutSession } = require("../../models/checkout");
const { validateCheckoutItems, groupItemsBySeller, calculateCheckoutSummary } = require("./checkout.helpers");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createValidationError } = require("../../utils/errors");
const logger = require("../../utils/logger");
const { getStripe, isStripeReady } = require("../../config/stripe.config");

const PAYMENT_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
};

/**
 * Confirm checkout and create orders atomically.
 *
 * Atomicity guarantee:
 * - Session lock (pending -> processing), price revalidation, stock deduction,
 *   order creation, and checkout session completion are in ONE Mongo transaction.
 *
 * Idempotency guarantee:
 * - Same checkout session + same idempotency key returns existing created orders.
 */
const confirmCheckoutAndCreateOrders = async (sessionId, userId, idempotencyKey) => {
  const mongoSession = await mongoose.startSession();
  let finalResult = null;
  logger.info("checkout.confirm.started", {
    sessionId: String(sessionId),
    userId: String(userId),
  });

  try {
    await mongoSession.withTransaction(async () => {
      let checkoutSession = await CheckoutSession.findOne({
        _id: sessionId,
        userId,
      }).session(mongoSession);

      if (!checkoutSession) {
        handleNotFoundError(
          "Checkout session",
          "SESSION_NOT_FOUND",
          "confirm_checkout",
          { sessionId, userId },
        );
      }

      if (checkoutSession.isExpired) {
        createValidationError(
          "Checkout session has expired",
          { sessionId },
          "SESSION_EXPIRED",
        );
      }

      if (!idempotencyKey || String(idempotencyKey) !== String(checkoutSession.checkoutSessionKey)) {
        createValidationError(
          "Invalid checkout confirmation key. Please refresh checkout and try again.",
          { sessionId },
          "CHECKOUT_IDEMPOTENCY_KEY_INVALID",
        );
      }

      if (checkoutSession.status === "completed") {
        const existingOrders = await Order.find({
          _id: { $in: checkoutSession.createdOrders || [] },
        }).session(mongoSession);
        finalResult = {
          success: true,
          idempotentReplay: true,
          orders: existingOrders,
          orderIds: existingOrders.map((order) => order._id),
        };
        logger.info("checkout.confirm.idempotent_replay", {
          sessionId: String(sessionId),
          userId: String(userId),
          orderIds: finalResult.orderIds.map((id) => String(id)),
        });
        return;
      }

      if (checkoutSession.status !== "pending") {
        createValidationError(
          "Checkout confirmation is already in progress. Please wait.",
          { sessionId, status: checkoutSession.status },
          "CHECKOUT_CONFIRM_IN_PROGRESS",
        );
      }

      const lockedSession = await CheckoutSession.findOneAndUpdate(
        {
          _id: sessionId,
          userId,
          status: "pending",
          checkoutSessionKey: String(idempotencyKey),
        },
        { $set: { status: "processing" } },
        { new: true, session: mongoSession },
      );

      if (!lockedSession) {
        const latestSession = await CheckoutSession.findOne({
          _id: sessionId,
          userId,
        }).session(mongoSession);

        if (latestSession?.status === "completed") {
          const existingOrders = await Order.find({
            _id: { $in: latestSession.createdOrders || [] },
          }).session(mongoSession);
          finalResult = {
            success: true,
            idempotentReplay: true,
            orders: existingOrders,
            orderIds: existingOrders.map((order) => order._id),
          };
          logger.info("checkout.confirm.idempotent_replay", {
            sessionId: String(sessionId),
            userId: String(userId),
            orderIds: finalResult.orderIds.map((id) => String(id)),
          });
          return;
        }

        createValidationError(
          "Checkout confirmation is already in progress. Please wait.",
          { sessionId },
          "CHECKOUT_CONFIRM_IN_PROGRESS",
        );
      }
      checkoutSession = lockedSession;

      if (!checkoutSession.deliveryMethod || !checkoutSession.deliveryAddress) {
        createValidationError(
          "Delivery details are required",
          { sessionId },
          "MISSING_DELIVERY_DETAILS",
        );
      }

      if (!checkoutSession.paymentMethod) {
        createValidationError(
          "Payment method is required",
          { sessionId },
          "MISSING_PAYMENT_METHOD",
        );
      }

      // Recalculate prices and validate stock server-side right before order creation.
      const checkoutItems = (checkoutSession.items || []).map((item) => ({
        listingId: item.listingId,
        quantity: item.quantity,
        variantId: item.variantId || null,
      }));
      const validation = await validateCheckoutItems(checkoutItems);
      if (!validation.valid) {
        createValidationError(
          "Some items are no longer available or in stock.",
          { errors: validation.errors },
          "CHECKOUT_ITEMS_REVALIDATION_FAILED",
        );
      }

      const sellerGroups = await groupItemsBySeller(
        validation.validatedItems,
        checkoutSession.deliveryMethod,
        checkoutSession.paymentMethod,
      );
      const pricing = calculateCheckoutSummary(sellerGroups);
      checkoutSession.sellerGroups = sellerGroups;
      checkoutSession.pricing = pricing;

      let paymentStatus = PAYMENT_STATUS.PENDING_PAYMENT;
      let paymentDetails = { paidAt: null, transactionId: null };

      if (["credit_card", "e_wallet"].includes(checkoutSession.paymentMethod)) {
        if (!checkoutSession.stripePaymentIntentId) {
          createValidationError(
            "Payment intent not created",
            { sessionId },
            "PAYMENT_INTENT_REQUIRED",
          );
        }

        if (isStripeReady()) {
          try {
            const stripe = getStripe();
            const paymentIntent = await stripe.paymentIntents.retrieve(
              checkoutSession.stripePaymentIntentId,
            );
            if (paymentIntent.status === "succeeded") {
              paymentStatus = PAYMENT_STATUS.PAID;
              paymentDetails = {
                paidAt: new Date(),
                transactionId: paymentIntent.id,
              };
            } else if (
              paymentIntent.status === "requires_action" ||
              paymentIntent.status === "processing"
            ) {
              paymentStatus = PAYMENT_STATUS.PENDING_PAYMENT;
            } else {
              createValidationError(
                "Payment was not completed. Please try again.",
                { sessionId, stripeStatus: paymentIntent.status },
                "PAYMENT_FAILED",
              );
            }
          } catch (stripeError) {
            logger.error("Failed to verify Stripe payment", {
              sessionId,
              paymentIntentId: checkoutSession.stripePaymentIntentId,
              error: stripeError.message,
            });
          }
        }
      } else if (checkoutSession.paymentMethod === "toyyibpay") {
        paymentDetails = {
          ...paymentDetails,
          paymentProvider: "toyyibpay",
        };
      }

      const createdOrders = await createOrdersFromSessionTransactional({
        checkoutSession,
        userId,
        paymentStatus,
        paymentDetails,
        dbSession: mongoSession,
      });

      if (createdOrders.length === 0) {
        createValidationError(
          "Failed to create orders.",
          { sessionId },
          "ORDER_CREATION_FAILED",
        );
      }

      checkoutSession.markCompleted(createdOrders.map((order) => order._id));
      await checkoutSession.save({ session: mongoSession });

      finalResult = {
        success: true,
        orders: createdOrders,
        orderIds: createdOrders.map((order) => order._id),
      };
    });

    if (!finalResult) {
      createValidationError(
        "Failed to confirm checkout.",
        { sessionId },
        "CHECKOUT_CONFIRM_FAILED",
      );
    }

    // Do not clear cart for ToyyibPay until payment success callback.
    const firstOrder = finalResult.orders?.[0];
    if (firstOrder?.paymentMethod !== "toyyibpay") {
      const completedSession = await CheckoutSession.findById(sessionId);
      if (completedSession?.sessionType === "cart") {
        await clearCartAfterCheckout(userId, completedSession.items);
      }
    }

    logger.info("Checkout confirmed and orders created atomically", {
      sessionId,
      userId,
      orderCount: finalResult.orders.length,
      orderIds: finalResult.orderIds,
      action: "confirm_checkout_atomic",
    });
    logger.info("checkout.confirm.completed", {
      sessionId: String(sessionId),
      userId: String(userId),
      orderIds: (finalResult.orderIds || []).map((id) => String(id)),
    });

    return finalResult;
  } catch (error) {
    await CheckoutSession.updateOne(
      { _id: sessionId, userId, status: "processing" },
      { $set: { status: "pending" } },
    ).catch(() => null);
    return handleServiceError(error, "confirmCheckoutAndCreateOrders", {
      sessionId,
      userId,
    });
  } finally {
    await mongoSession.endSession();
  }
};

const createOrdersFromSessionTransactional = async ({
  checkoutSession,
  userId,
  paymentStatus,
  paymentDetails,
  dbSession,
}) => {
  const buyer = await User.findById(userId)
    .select("+email profile roles")
    .session(dbSession);
  if (!buyer) {
    handleNotFoundError("User", "USER_NOT_FOUND", "confirm_checkout_atomic", { userId });
  }

  const createdOrders = [];
  for (const sellerGroup of checkoutSession.sellerGroups) {
    const seller = await User.findById(sellerGroup.sellerId)
      .select("+email profile roles merchantDetails")
      .session(dbSession);
    if (!seller) {
      handleNotFoundError("Seller", "SELLER_NOT_FOUND", "confirm_checkout_atomic", {
        sellerId: sellerGroup.sellerId,
      });
    }

    const sellerDisplayName = seller.roles.includes("merchant")
      ? seller.merchantDetails?.shopName || seller.profile.username
      : seller.profile.username;

    const processedItems = [];
    for (const item of sellerGroup.items) {
      const listing = await Listing.findById(item.listingId).session(dbSession);
      if (!listing || !listing.isAvailable) {
        createValidationError(
          "Listing unavailable during checkout confirmation.",
          { listingId: item.listingId },
          "LISTING_UNAVAILABLE",
        );
      }

      if (listing.type === "product") {
        if (item.variantId) {
          const updated = await Listing.updateOne(
            {
              _id: item.listingId,
              "variants._id": item.variantId,
              "variants.stock": { $gte: item.quantity },
              "variants.isAvailable": true,
            },
            { $inc: { "variants.$.stock": -item.quantity } },
            { session: dbSession },
          );
          if (updated.modifiedCount !== 1) {
            createValidationError(
              "Insufficient variant stock during checkout confirmation.",
              { listingId: item.listingId, variantId: item.variantId },
              "INSUFFICIENT_STOCK",
            );
          }
        } else {
          const updated = await Listing.updateOne(
            {
              _id: item.listingId,
              stock: { $gte: item.quantity },
              isAvailable: true,
            },
            { $inc: { stock: -item.quantity } },
            { session: dbSession },
          );
          if (updated.modifiedCount !== 1) {
            createValidationError(
              "Insufficient stock during checkout confirmation.",
              { listingId: item.listingId },
              "INSUFFICIENT_STOCK",
            );
          }
        }
      }

      const processedItem = {
        listingId: item.listingId,
        name: item.name,
        description: listing.description || "",
        price: item.price,
        quantity: item.quantity,
        images: listing.images || [],
        discount: 0,
        type: listing.type,
      };
      if (item.variantId) {
        processedItem.variantId = item.variantId;
      }
      if (item.variantSnapshot) {
        processedItem.variantSnapshot = item.variantSnapshot;
      }
      processedItems.push(processedItem);
    }

    const order = new Order({
      buyer: {
        userId: buyer._id,
        username: buyer.profile.username,
        email: buyer.email,
        phone: buyer.profile.phoneNumber,
      },
      seller: {
        userId: seller._id,
        name: sellerDisplayName,
        email: seller.email,
        phone: seller.profile.phoneNumber || "0123456789",
      },
      items: processedItems,
      itemsTotal: sellerGroup.subtotal,
      shippingFee: sellerGroup.deliveryFee,
      totalDiscount: 0,
      totalAmount: sellerGroup.totalAmount,
      paymentMethod: checkoutSession.paymentMethod,
      paymentStatus,
      paymentDetails,
      deliveryMethod: checkoutSession.deliveryMethod,
      deliveryAddress: checkoutSession.deliveryAddress,
      status: paymentStatus === PAYMENT_STATUS.PAID ? "confirmed" : "pending",
      checkoutSessionId: checkoutSession._id,
      confirmedAt: paymentStatus === PAYMENT_STATUS.PAID ? new Date() : null,
    });

    await order.save({ session: dbSession });
    createdOrders.push(order);
  }

  return createdOrders;
};

/**
 * Clear cart items after successful checkout/payment.
 */
const clearCartAfterCheckout = async (userId, checkoutItems) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return;

    const checkoutListingIds = checkoutItems.map((item) => item.listingId.toString());
    cart.items = cart.items.filter(
      (item) => !checkoutListingIds.includes(item.listing.toString()),
    );
    await cart.save();

    logger.info("Cart cleared after checkout/payment", {
      userId,
      removedItemCount: checkoutListingIds.length,
      remainingItemCount: cart.items.length,
      action: "clear_cart_after_checkout",
    });
  } catch (error) {
    logger.error("Failed to clear cart after checkout/payment", {
      userId,
      error: error.message,
    });
  }
};

const clearCartForOrderPaymentSuccess = async (order) => {
  if (!order?.buyer?.userId || !Array.isArray(order.items)) return;
  const checkoutItems = order.items.map((item) => ({ listingId: item.listingId }));
  await clearCartAfterCheckout(order.buyer.userId, checkoutItems);
};

module.exports = {
  confirmCheckoutAndCreateOrders,
  clearCartAfterCheckout,
  clearCartForOrderPaymentSuccess,
};
