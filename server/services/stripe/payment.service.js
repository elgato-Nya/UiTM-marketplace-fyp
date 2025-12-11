/**
 * Stripe Payment Service
 *
 * PURPOSE: Handle Stripe payment intent creation and processing
 * SCOPE: Payment intents, Connect transfers, webhooks
 * SECURITY: Server-side only, never expose secret keys
 */

const {
  getStripe,
  stripeConfig,
  convertToCents,
  isStripeReady,
} = require("../../config/stripe.config");
const { CheckoutSession } = require("../../models/checkout");
const { Order, User } = require("../../models");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { createBadRequestError } = require("../../utils/errors");
const logger = require("../../utils/logger");

/**
 * Create payment intent for checkout session
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} sessionId - Checkout session ID
 * @returns {Promise<Object>} Payment intent data
 */
const createPaymentIntent = async (userId, sessionId) => {
  try {
    if (!isStripeReady()) {
      throw createBadRequestError(
        "Payment processing is currently unavailable. Please contact support or use Cash on Delivery.",
        "STRIPE_NOT_CONFIGURED"
      );
    }

    const stripe = getStripe();

    // Get checkout session
    const session = await CheckoutSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      handleNotFoundError(
        "Checkout Session",
        "SESSION_NOT_FOUND",
        "createPaymentIntent",
        { sessionId: sessionId.toString() }
      );
    }

    if (session.isExpired()) {
      throw createBadRequestError(
        "Checkout session has expired",
        "SESSION_EXPIRED"
      );
    }

    if (session.paymentMethod === "cod") {
      throw createBadRequestError(
        "Cannot create payment intent for Cash on Delivery orders",
        "INVALID_PAYMENT_METHOD"
      );
    }

    // Check minimum amount
    if (session.pricing.totalAmount < stripeConfig.minimumAmount) {
      throw createBadRequestError(
        `Amount below minimum. Minimum payment amount is RM ${stripeConfig.minimumAmount}`,
        "AMOUNT_BELOW_MINIMUM"
      );
    }

    // Check if payment intent already exists
    if (session.stripePaymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          session.stripePaymentIntentId
        );

        if (existingIntent.status === "succeeded") {
          throw createBadRequestError(
            "Payment already completed for this session",
            "PAYMENT_ALREADY_COMPLETED"
          );
        }

        // Return existing intent if still valid
        if (
          ["requires_payment_method", "requires_confirmation"].includes(
            existingIntent.status
          )
        ) {
          logger.info("Returning existing payment intent", {
            sessionId: sessionId.toString(),
            paymentIntentId: existingIntent.id,
          });

          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            amount: session.pricing.totalAmount,
          };
        }
      } catch (error) {
        // If intent doesn't exist or is invalid, create new one
        logger.warn("Existing payment intent invalid, creating new one", {
          error: error.message,
        });
      }
    }

    // Get user details
    const user = await User.findById(userId).select("email profile");

    // Convert amount to cents
    const amountInCents = convertToCents(session.pricing.totalAmount);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: stripeConfig.currency,
      metadata: {
        sessionId: sessionId.toString(),
        userId: userId.toString(),
        sellerCount: session.sellerGroups.length.toString(),
        sessionType: session.sessionType,
      },
      description: `MarKet - ${session.items.length} item(s)`,
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update session with payment intent ID
    session.stripePaymentIntentId = paymentIntent.id;
    session.status = "processing";
    await session.save();

    logger.info("Payment intent created", {
      userId: userId.toString(),
      sessionId: sessionId.toString(),
      paymentIntentId: paymentIntent.id,
      amount: session.pricing.totalAmount,
      amountCents: amountInCents,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: session.pricing.totalAmount,
      publishableKey: stripeConfig.publishableKey,
    };
  } catch (error) {
    return handleServiceError(error, "createPaymentIntent", {
      userId: userId.toString(),
      sessionId: sessionId.toString(),
    });
  }
};

/**
 * Confirm payment intent (called after successful payment)
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Confirmation result
 */
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    if (!isStripeReady()) {
      throw createBadRequestError(
        "Payment processing unavailable",
        "STRIPE_NOT_CONFIGURED"
      );
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw createBadRequestError(
        `Payment not successful. Status: ${paymentIntent.status}`,
        "PAYMENT_NOT_SUCCESSFUL"
      );
    }

    logger.info("Payment intent confirmed", {
      paymentIntentId,
      status: paymentIntent.status,
    });

    return {
      success: true,
      status: paymentIntent.status,
      paymentIntentId,
    };
  } catch (error) {
    return handleServiceError(error, "confirmPaymentIntent", {
      paymentIntentId,
    });
  }
};

/**
 * Cancel payment intent
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Cancellation result
 */
const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    if (!isStripeReady()) {
      return { success: true, message: "Stripe not configured" };
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    logger.info("Payment intent cancelled", {
      paymentIntentId,
      status: paymentIntent.status,
    });

    return {
      success: true,
      status: paymentIntent.status,
      paymentIntentId,
    };
  } catch (error) {
    logger.error("Failed to cancel payment intent", {
      paymentIntentId,
      error: error.message,
    });

    // Don't throw error, just log it
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get payment intent status
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Payment intent status
 */
const getPaymentIntentStatus = async (paymentIntentId) => {
  try {
    if (!isStripeReady()) {
      throw createBadRequestError(
        "Payment processing unavailable",
        "STRIPE_NOT_CONFIGURED"
      );
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    return handleServiceError(error, "getPaymentIntentStatus", {
      paymentIntentId,
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  getPaymentIntentStatus,
};
