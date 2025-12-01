const CheckoutSession = require("../../models/checkout/checkoutSession.model");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createValidationError } = require("../../utils/errors");
const {
  checkoutErrorMessages,
} = require("../../validators/checkout/checkout.validator");
const logger = require("../../utils/logger");
const {
  getStripe,
  isStripeReady,
  convertToCents,
} = require("../../config/stripe.config");

/**
 * Checkout Payment Service
 *
 * PURPOSE: Handle Stripe payment operations for checkout
 * PATTERN: Follows your service pattern with proper error handling
 * SCOPE: Payment intent creation, verification, Stripe interactions
 */

/**
 * Create Stripe payment intent for session
 * @param {ObjectId} sessionId - Session ID
 * @param {ObjectId} userId - User ID
 * @returns {Object} { clientSecret, paymentIntentId }
 */
const createPaymentIntent = async (sessionId, userId) => {
  try {
    if (!isStripeReady()) {
      logger.warn("Stripe payment intent requested but Stripe not configured", {
        sessionId,
        userId,
        action: "create_payment_intent",
      });
      createValidationError(
        checkoutErrorMessages.payment.stripeNotConfigured,
        { sessionId },
        "STRIPE_NOT_CONFIGURED"
      );
    }

    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      handleNotFoundError(
        "Payment Session",
        "SESSION_NOT_FOUND",
        "create_payment_intent",
        {
          sessionId: sessionId.toString(),
          userId: userId.toString(),
        }
      );
    }
    if (session.isExpired) {
      createValidationError(
        checkoutErrorMessages.session.expired,
        { sessionId },
        "SESSION_EXPIRED"
      );
    }

    // check if payment intent already exists
    if (session.stripePaymentIntentId) {
      const stripe = getStripe();
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          session.stripePaymentIntentId
        );

        if (existingIntent.status !== "canceled") {
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          };
        }
      } catch (error) {
        logger.warn("Existing payment intent not found, creating new one", {
          sessionId,
          oldPaymentIntentId: session.stripePaymentIntentId,
        });
      }
    }

    const stripe = getStripe();
    const amountInCents = convertToCents(session.pricing.totalAmount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "myr",
      metadata: {
        checkoutSessionId: sessionId.toString(),
        userId: userId.toString(),
        sellerCount: session.sellerGroups.length,
      },
      description: `Order payment for ${session.items.length} item(s) from ${session.sellerGroups.length} seller(s)`,
    });

    // update session
    session.stripePaymentIntentId = paymentIntent.id;
    session.stripeClientSecret = paymentIntent.client_secret;
    session.status = "payment_intent_created";
    await session.save();

    logger.info("Stripe payment intent created", {
      sessionId: session._id,
      userId,
      paymentIntentId: paymentIntent.id,
      amount: session.pricing.totalAmount,
      action: "create_payment_intent",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    // Handle Stripe-specific errors
    if (error.type === "StripeInvalidRequestError") {
      logger.error("Stripe invalid request", {
        sessionId,
        userId,
        error: error.message,
      });
      createValidationError(
        checkoutErrorMessages.payment.invalidAmount,
        { stripeError: error.message },
        "STRIPE_INVALID_REQUEST"
      );
    }

    return handleServiceError(error, "createPaymentIntent", {
      sessionId: sessionId.toString(),
      userId: userId.toString(),
    });
  }
};

/**
 * Get payment status for session
 * @param {ObjectId} sessionId - Session ID
 * @param {ObjectId} userId - User ID
 * @returns {Object} Payment status info
 */
const getPaymentStatus = async (sessionId, userId) => {
  try {
    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      handleNotFoundError(
        "Checkout session",
        "SESSION_NOT_FOUND",
        "get_payment_status",
        { sessionId, userId }
      );
    }

    // if no payment intent, return pending
    if (!session.stripePaymentIntentId) {
      return {
        status: "no_payment_intent",
        paymentIntentId: null,
      };
    }

    if (!isStripeReady()) {
      return {
        status: "stripe_unavailable",
        paymentIntentId: session.stripePaymentIntentId,
      };
    }

    // Get payment intent from Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.stripePaymentIntentId
    );

    return {
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    return handleServiceError(error, "getPaymentStatus", {
      sessionId,
      userId,
    });
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentStatus,
};
