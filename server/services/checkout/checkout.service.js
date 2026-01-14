const { Cart } = require("../../models");
const CheckoutSession = require("../../models/checkout/checkoutSession.model");
const {
  validateCheckoutItems,
  groupItemsBySeller,
  calculateCheckoutSummary,
  reserveStock,
  releaseStock,
  validateDeliveryAddress,
  validateCampusDeliveryForSellers,
  checkPaymentMethodAllowed,
} = require("./checkout.helpers");
const {
  handleServiceError,
  handleNotFoundError,
  convertAddressEnumsToValues,
} = require("../base.service");
const { createValidationError } = require("../../utils/errors");
const {
  checkoutErrorMessages,
} = require("../../validators/checkout/checkout.validator");
const logger = require("../../utils/logger");

/**
 * Checkout Service - Session Management
 *
 * PURPOSE: Core checkout session operations (CRUD)
 * PATTERN: Follows your service pattern with proper error handling
 * SCOPE: Session creation, retrieval, update, cancellation only
 */

// TODO: cart and direct checkout share almost identical funtionality so maybe can be extract a helper function here
/**
 * Create checkout session from cart
 * @param {ObjectId} userId - User ID
 * @returns {CheckoutSession} Created session
 */
const createCartCheckoutSession = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.listing",
      select: "name price stock images isAvailable category seller type",
      populate: {
        path: "seller.userId",
        select: "email profile.username",
      },
    });

    if (!cart) {
      handleNotFoundError(
        "Cart",
        "CART_NOT_FOUND",
        "create_cart_checkout_session",
        { userId: userId.toString() }
      );
    }
    if (cart.items.length === 0) {
      createValidationError(
        checkoutErrorMessages.cart.empty,
        { userId: userId.toString() },
        "CART_EMPTY"
      );
    }

    // TODO: [SELECTED CHECKOUT] Filter cart items based on selection
    // When implementing selected checkout, add a field like `isSelected` to CartItemSchema
    // Then filter here: const selectedItems = cart.items.filter(item => item.isSelected);
    // For now, we checkout all items in cart

    const items = cart.items.map((item) => ({
      listingId: item.listing._id,
      quantity: item.quantity,
      variantId: item.variantId || null,
    }));

    // cancel any existing active sessions
    await CheckoutSession.cancelActiveSessionsForUser(userId);

    // validate items
    const validation = await validateCheckoutItems(items);
    if (!validation.valid) {
      logger.warn("Checkout validation failed", {
        userId,
        errors: validation.errors,
        action: "create_cart_checkout_session",
      });
      createValidationError(
        checkoutErrorMessages.items.unavailable,
        { errors: validation.errors },
        "CART_VALIDATION_FAILED"
      );
    }

    // Group by seller (initially without delivery/payment info)
    const sellerGroups = await groupItemsBySeller(
      validation.validatedItems,
      "delivery", // Default delivery method
      "cod" // Default to COD for initial calculation
    );

    // Calculate summary
    const pricing = calculateCheckoutSummary(sellerGroups);

    // Reserve stock
    const stockReservations = await reserveStock(validation.validatedItems);

    // Create session
    const session = new CheckoutSession({
      userId,
      sessionType: "cart",
      items: validation.validatedItems.map((item) => {
        const sessionItem = {
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
        };
        // Add variant data if present
        if (item.variantId) {
          sessionItem.variantId = item.variantId;
          sessionItem.variantSnapshot = item.variantSnapshot;
        }
        return sessionItem;
      }),
      sellerGroups,
      pricing,
      stockReservations,
      status: "pending",
    });

    await session.save();

    logger.info("Checkout session created from cart", {
      sessionId: session._id,
      userId,
      itemCount: items.length,
      sellerCount: sellerGroups.length,
      totalAmount: pricing.totalAmount,
      action: "create_cart_checkout_session",
    });

    // Convert address enum keys to values for client response
    const sessionObj = session.toObject();
    if (sessionObj.deliveryAddress) {
      sessionObj.deliveryAddress = convertAddressEnumsToValues(
        sessionObj.deliveryAddress
      );
    }

    return sessionObj;
  } catch (error) {
    return handleServiceError(error, "create_cart_checkout_session", {
      userId: userId.toString(),
    });
  }
};

/**
 * Create checkout session from direct purchase
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} listingId - Listing ID
 * @param {Number} quantity - Quantity to purchase
 * @param {ObjectId|null} variantId - Optional variant ID
 * @returns {CheckoutSession} Created session
 */
const createDirectCheckoutSession = async (
  userId,
  listingId,
  quantity = 1,
  variantId = null
) => {
  try {
    // Cancel any existing active sessions
    await CheckoutSession.cancelActiveSessionsForUser(userId);

    // Validate listing with variant support
    const validation = await validateCheckoutItems([
      { listingId, quantity, variantId },
    ]);
    if (!validation.valid) {
      logger.warn("Direct checkout validation failed", {
        userId,
        listingId,
        quantity,
        variantId,
        errors: validation.errors,
        action: "create_checkout_session_from_listing",
      });
      createValidationError(
        checkoutErrorMessages.listing.unavailable,
        { errors: validation.errors },
        "LISTING_VALIDATION_FAILED"
      );
    }

    // Group by seller
    const sellerGroups = await groupItemsBySeller(
      validation.validatedItems,
      "delivery",
      "cod"
    );

    // Calculate summary
    const pricing = calculateCheckoutSummary(sellerGroups);

    // Reserve stock
    const stockReservations = await reserveStock(validation.validatedItems);

    // Create session
    const session = new CheckoutSession({
      userId,
      sessionType: "direct",
      items: validation.validatedItems.map((item) => {
        const sessionItem = {
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
        };
        // Add variant data if present
        if (item.variantId) {
          sessionItem.variantId = item.variantId;
          sessionItem.variantSnapshot = item.variantSnapshot;
        }
        return sessionItem;
      }),
      sellerGroups,
      pricing,
      stockReservations,
      status: "pending",
    });

    await session.save();

    logger.info("Checkout session created from direct purchase", {
      sessionId: session._id,
      userId,
      listingId,
      quantity,
      variantId,
      totalAmount: pricing.totalAmount,
      action: "create_checkout_session_from_listing",
    });

    // Convert address enum keys to values for client response
    const sessionObj = session.toObject();
    if (sessionObj.deliveryAddress) {
      sessionObj.deliveryAddress = convertAddressEnumsToValues(
        sessionObj.deliveryAddress
      );
    }

    return sessionObj;
  } catch (error) {
    return handleServiceError(error, "createCheckoutSessionFromListing", {
      userId: userId.toString(),
      listingId: listingId.toString(),
      quantity,
    });
  }
};

/**
 * Get active checkout session for user
 * @param {ObjectId} userId - User ID
 * @returns {CheckoutSession} Active session or null
 */
const getActiveSession = async (userId) => {
  try {
    const session = await CheckoutSession.findActiveSession(userId);
    if (!session) return null;

    // Check if session is expired
    if (session.isExpired) {
      await releaseStock(session.stockReservations);
      session.status = "expired";
      await session.save();

      logger.info("Checkout session expired", {
        sessionId: session._id,
        userId,
        action: "get_active_session",
      });

      return null;
    }

    // Convert address enum keys to values for client response
    const sessionObj = session.toObject();
    if (sessionObj.deliveryAddress) {
      sessionObj.deliveryAddress = convertAddressEnumsToValues(
        sessionObj.deliveryAddress
      );
    }

    return sessionObj;
  } catch (error) {
    return handleServiceError(error, "get_active_session", {
      userId: userId.toString(),
    });
  }
};

/**
 * Update checkout session with delivery and payment details
 * @param {ObjectId} sessionId - Session ID
 * @param {ObjectId} userId - User ID
 * @param {Object} updateData - { deliveryMethod, deliveryAddress, paymentMethod, addressId }
 * @returns {CheckoutSession} Updated session
 */
const updateCheckoutSession = async (sessionId, userId, updateData) => {
  try {
    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      handleNotFoundError(
        "Checkout session",
        "SESSION_NOT_FOUND",
        "update_checkout_session",
        { sessionId, userId }
      );
    }

    if (session.isExpired) {
      createValidationError(
        checkoutErrorMessages.session.expired,
        { sessionId },
        "SESSION_EXPIRED"
      );
    }

    if (session.status !== "pending") {
      createValidationError(
        checkoutErrorMessages.session.notModifiable,
        { status: session.status },
        "SESSION_NOT_MODIFIABLE"
      );
    }

    const { deliveryMethod, deliveryAddress, paymentMethod, addressId } =
      updateData;

    // TODO: seriously can be shorthen if using validation middleware or some sort but im 100% sure that this can be seperated
    // Update delivery method and address
    if (deliveryMethod) {
      // Validate address for delivery method
      if (
        deliveryAddress &&
        !validateDeliveryAddress(deliveryMethod, deliveryAddress)
      ) {
        createValidationError(
          checkoutErrorMessages.deliveryAddress.invalid,
          { deliveryMethod },
          "INVALID_DELIVERY_ADDRESS"
        );
      }

      // Validate campus delivery for all sellers if applicable
      const isCampusDelivery = ["campus_delivery", "room_delivery"].includes(
        deliveryMethod
      );
      if (
        isCampusDelivery &&
        deliveryAddress?.type === "campus" &&
        deliveryAddress?.campusAddress?.campus
      ) {
        const campusKey = deliveryAddress.campusAddress.campus;
        const campusValidation = await validateCampusDeliveryForSellers(
          session.sellerGroups,
          campusKey
        );

        if (!campusValidation.valid) {
          logger.warn("Campus delivery validation failed in checkout", {
            userId,
            sessionId,
            campus: campusKey,
            invalidSellers: campusValidation.invalidSellers,
            reason: campusValidation.reason,
          });
          createValidationError(
            campusValidation.reason ||
              "One or more sellers do not deliver to this campus",
            {
              campus: campusKey,
              invalidSellers: campusValidation.invalidSellers,
            },
            "CAMPUS_NOT_DELIVERABLE"
          );
        }
      }

      // Recalculate fees with new delivery method
      const newSellerGroups = await groupItemsBySeller(
        session.items,
        deliveryMethod,
        paymentMethod || "cod"
      );
      const newPricing = calculateCheckoutSummary(newSellerGroups);

      session.sellerGroups = newSellerGroups;
      session.pricing = newPricing;
      session.deliveryMethod = deliveryMethod;

      if (deliveryAddress) {
        session.deliveryAddress = {
          ...deliveryAddress,
          addressId: addressId || null,
        };
      }
    }

    // Update payment method
    if (paymentMethod) {
      // Check if payment method is allowed
      const paymentCheck = checkPaymentMethodAllowed(
        paymentMethod,
        session.pricing.totalAmount
      );

      if (!paymentCheck.allowed) {
        createValidationError(
          paymentCheck.reason,
          { paymentMethod, totalAmount: session.pricing.totalAmount },
          "PAYMENT_METHOD_NOT_ALLOWED"
        );
      }

      // Recalculate fees with new payment method
      const newSellerGroups = await groupItemsBySeller(
        session.items,
        session.deliveryMethod || "delivery",
        paymentMethod
      );
      const newPricing = calculateCheckoutSummary(newSellerGroups);

      session.sellerGroups = newSellerGroups;
      session.pricing = newPricing;
      session.paymentMethod = paymentMethod;
    }

    // Use save with version increment handling
    // If there's a version conflict, fetch the latest and retry once
    try {
      await session.save();
    } catch (saveError) {
      if (
        saveError.name === "VersionError" ||
        saveError.message?.includes("version")
      ) {
        logger.warn("Version conflict detected, retrying with fresh document", {
          sessionId: session._id,
          action: "update_checkout_session_retry",
        });

        // Fetch fresh document and apply changes
        const freshSession = await CheckoutSession.findById(session._id);
        if (freshSession && freshSession.status === "pending") {
          freshSession.sellerGroups = session.sellerGroups;
          freshSession.pricing = session.pricing;
          if (session.deliveryMethod)
            freshSession.deliveryMethod = session.deliveryMethod;
          if (session.paymentMethod)
            freshSession.paymentMethod = session.paymentMethod;
          if (session.deliveryAddress)
            freshSession.deliveryAddress = session.deliveryAddress;
          await freshSession.save();

          // Update reference for response
          Object.assign(session, freshSession.toObject());
        } else {
          throw saveError;
        }
      } else {
        throw saveError;
      }
    }

    logger.info("Checkout session updated", {
      sessionId: session._id,
      userId,
      deliveryMethod: session.deliveryMethod,
      paymentMethod: session.paymentMethod,
      totalAmount: session.pricing.totalAmount,
      action: "update_checkout_session",
    });

    // Convert address enum keys to values for client response
    const sessionObj = session.toObject();
    if (sessionObj.deliveryAddress) {
      sessionObj.deliveryAddress = convertAddressEnumsToValues(
        sessionObj.deliveryAddress
      );
    }

    return sessionObj;
  } catch (error) {
    return handleServiceError(error, "updateCheckoutSession", {
      sessionId,
      userId,
    });
  }
};

/**
 * Cancel checkout session
 * @param {ObjectId} sessionId - Session ID
 * @param {ObjectId} userId - User ID
 * @returns {Boolean} Success
 */
const cancelCheckoutSession = async (sessionId, userId) => {
  try {
    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      handleNotFoundError(
        "Checkout session",
        "SESSION_NOT_FOUND",
        "cancel_checkout_session",
        { sessionId, userId }
      );
    }

    if (session.status === "completed") {
      createValidationError(
        checkoutErrorMessages.session.alreadyCompleted,
        { sessionId },
        "SESSION_ALREADY_COMPLETED"
      );
    }

    // Release stock reservations
    await releaseStock(session.stockReservations);

    // Mark as cancelled
    session.markCancelled();
    await session.save();

    logger.info("Checkout session cancelled", {
      sessionId: session._id,
      userId,
      action: "cancel_checkout_session",
    });

    return true;
  } catch (error) {
    return handleServiceError(error, "cancelCheckoutSession", {
      sessionId,
      userId,
    });
  }
};

module.exports = {
  createCartCheckoutSession,
  createDirectCheckoutSession,
  getActiveSession,
  updateCheckoutSession,
  cancelCheckoutSession,
};
