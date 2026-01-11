const express = require("express");
const {
  handleCreateCartCheckoutSession,
  handleCreateDirectCheckoutSession,
  handleGetActiveSession,
  handleUpdateCheckoutSession,
  handleCancelCheckoutSession,
  handleCreatePaymentIntent,
  handleGetPaymentStatus,
  handleConfirmCheckout,
} = require("../../controllers/checkout/checkout.controller");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  validateCreateDirectCheckout,
  validateUpdateCheckoutSession,
  validateCreatePaymentIntent,
  validateSessionIdParam,
} = require("../../middleware/validations/checkout/checkout.validation");
const { checkoutLimiter } = require("../../middleware/limiters.middleware");

/**
 * Checkout Routes
 *
 * PURPOSE: Handle checkout session and payment operations
 * SCOPE: Session management, payment processing, order creation
 * AUTHENTICATION: All routes require authentication (no public access)
 * RATE LIMITING: checkoutLimiter (20 requests per 15 minutes)
 *
 * ROUTE STRUCTURE:
 * - POST /api/checkout/session/cart (create session from cart)
 * - POST /api/checkout/session/direct (create session from direct purchase)
 * - GET /api/checkout/session (get active session)
 * - PUT /api/checkout/session/:id (update/cancel session)
 * - DELETE /api/checkout/session/:id (cancel session)
 * - POST /api/checkout/payment-intent (create Stripe payment intent)
 * - GET /api/checkout/payment-status/:id (get payment status)
 * - POST /api/checkout/confirm/:id (confirm and create orders)
 *
 * BUSINESS RULES:
 * - Only authenticated users can checkout
 * - One active session per user at a time
 * - Sessions expire after 10 minutes
 * - Stock is virtually reserved during session
 * - Multi-vendor orders supported (one order per seller)
 * - COD and Stripe payments supported
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and rate limiting middleware to all routes
router.use(protect);
router.use(checkoutLimiter);

/**
 * @route   POST /api/checkout/session/cart
 * @desc    Create checkout session from cart
 * @access  Private (authenticated users only)
 * @returns Checkout session with items, pricing, and seller groups
 * @note    Cancels any existing active sessions for the user
 */
router.post("/session/cart", handleCreateCartCheckoutSession);

/**
 * @route   POST /api/checkout/session/direct
 * @desc    Create checkout session from direct purchase (Buy Now)
 * @access  Private (authenticated users only)
 * @body    { listingId, quantity }
 * @returns Checkout session with single item
 * @note    Used for "Buy Now" functionality from listing detail page
 */
router.post(
  "/session/direct",
  validateCreateDirectCheckout,
  handleCreateDirectCheckoutSession
);

/**
 * @route   GET /api/checkout/session
 * @desc    Get active checkout session for current user
 * @access  Private
 * @returns Active session or null
 * @note    Returns null if no active session or session expired
 */
router.get("/session", handleGetActiveSession);

/**
 * @route   PUT /api/checkout/session/:id
 * @desc    Update checkout session (delivery/payment details)
 * @access  Private
 * @params  id - Session ID
 * @body    { deliveryMethod, deliveryAddress, paymentMethod, addressId }
 * @returns Updated session with recalculated pricing
 * @note    Recalculates fees based on new delivery/payment method
 */
router.put(
  "/session/:id",
  validateSessionIdParam,
  validateUpdateCheckoutSession,
  handleUpdateCheckoutSession
);

/**
 * @route   DELETE /api/checkout/session/:id
 * @desc    Cancel checkout session
 * @access  Private
 * @params  id - Session ID
 * @returns Success confirmation
 * @note    Releases virtual stock reservations
 */
router.delete(
  "/session/:id",
  validateSessionIdParam,
  handleCancelCheckoutSession
);

/**
 * @route   POST /api/checkout/payment-intent
 * @desc    Create Stripe payment intent for online payment
 * @access  Private
 * @body    { sessionId }
 * @returns { clientSecret, paymentIntentId }
 * @note    Only for online payments (credit card), not COD
 */
router.post(
  "/payment-intent",
  validateCreatePaymentIntent,
  handleCreatePaymentIntent
);

/**
 * @route   GET /api/checkout/payment-status/:id
 * @desc    Get payment status for checkout session
 * @access  Private
 * @params  id - Session ID
 * @returns Payment status from Stripe
 * @note    Returns status, amount, currency if payment intent exists
 */
router.get(
  "/payment-status/:id",
  validateSessionIdParam,
  handleGetPaymentStatus
);

/**
 * @route   POST /api/checkout/confirm/:id
 * @desc    Confirm checkout and create orders
 * @access  Private
 * @params  id - Session ID
 * @returns { success: true, orders: [], orderIds: [] }
 * @note    Creates one order per seller, deducts stock, clears cart
 */
router.post("/confirm/:id", validateSessionIdParam, handleConfirmCheckout);

module.exports = router;
