const BaseController = require("../base.controller");
const {
  createCartCheckoutSession,
  createDirectCheckoutSession,
  getActiveSession,
  updateCheckoutSession,
  cancelCheckoutSession,
  createPaymentIntent,
  getPaymentStatus,
  confirmCheckoutAndCreateOrders,
} = require("../../services/checkout");
const { sanitizeObject } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

/**
 * Create checkout session from cart
 */
const handleCreateCartCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const session = await createCartCheckoutSession(userId);

  baseController.logAction("create_cart_checkout_session", req, {
    userId: userId.toString(),
    sessionId: session._id.toString(),
    itemCount: session.items.length,
    sellerCount: session.sellerGroups.length,
    totalAmount: session.pricing.totalAmount,
  });

  return baseController.sendSuccess(
    res,
    { session },
    "Checkout session created from cart",
    201
  );
}, "handle_create_cart_checkout_session");

/**
 * Create checkout session from direct purchase
 */
const handleCreateDirectCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { listingId, quantity } = sanitizeObject(req.body);

  const session = await createDirectCheckoutSession(
    userId,
    listingId,
    quantity
  );

  baseController.logAction("create_direct_checkout_session", req, {
    userId: userId.toString(),
    sessionId: session._id.toString(),
    listingId: listingId.toString(),
    quantity,
    totalAmount: session.pricing.totalAmount,
  });

  return baseController.sendSuccess(
    res,
    { session },
    "Checkout session created for direct purchase",
    201
  );
}, "handle_create_direct_checkout_session");

/**
 * Get active checkout session
 */
const handleGetActiveSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const session = await getActiveSession(userId);

  if (!session) {
    return baseController.sendSuccess(
      res,
      { session: null },
      "No active checkout session found"
    );
  }

  return baseController.sendSuccess(
    res,
    { session },
    "Active checkout session retrieved"
  );
}, "handle_get_active_session");

/**
 * Update checkout session
 */
const handleUpdateCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: sessionId } = req.params;
  const updateData = sanitizeObject(req.body);

  const session = await updateCheckoutSession(sessionId, userId, updateData);

  baseController.logAction("update_checkout_session", req, {
    userId: userId.toString(),
    sessionId: sessionId.toString(),
    deliveryMethod: session.deliveryMethod,
    paymentMethod: session.paymentMethod,
    totalAmount: session.pricing.totalAmount,
  });

  return baseController.sendSuccess(
    res,
    { session },
    "Checkout session updated successfully"
  );
}, "handle_update_checkout_session");

/**
 * Cancel checkout session
 */
const handleCancelCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: sessionId } = req.params;

  await cancelCheckoutSession(sessionId, userId);

  baseController.logAction("cancel_checkout_session", req, {
    userId: userId.toString(),
    sessionId: sessionId.toString(),
  });

  return baseController.sendSuccess(
    res,
    { cancelled: true },
    "Checkout session cancelled successfully"
  );
}, "handle_cancel_checkout_session");

/**
 * Create payment intent
 */
const handleCreatePaymentIntent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = sanitizeObject(req.body);

  const paymentIntent = await createPaymentIntent(sessionId, userId);

  baseController.logAction("create_payment_intent", req, {
    userId: userId.toString(),
    sessionId: sessionId.toString(),
    paymentIntentId: paymentIntent.paymentIntentId,
  });

  return baseController.sendSuccess(
    res,
    { paymentIntent },
    "Payment intent created successfully",
    201
  );
}, "handle_create_payment_intent");

/**
 * Get payment status
 */
const handleGetPaymentStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: sessionId } = req.params;

  const paymentStatus = await getPaymentStatus(sessionId, userId);

  return baseController.sendSuccess(
    res,
    { paymentStatus },
    "Payment status retrieved successfully"
  );
}, "handle_get_payment_status");

/**
 * Confirm checkout and create orders
 */
const handleConfirmCheckout = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: sessionId } = req.params;

  const result = await confirmCheckoutAndCreateOrders(sessionId, userId);

  baseController.logAction("confirm_checkout", req, {
    userId: userId.toString(),
    sessionId: sessionId.toString(),
    orderCount: result.orders.length,
    orderIds: result.orderIds,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Checkout confirmed and orders created successfully",
    201
  );
}, "handle_confirm_checkout");

module.exports = {
  handleCreateCartCheckoutSession,
  handleCreateDirectCheckoutSession,
  handleGetActiveSession,
  handleUpdateCheckoutSession,
  handleCancelCheckoutSession,
  handleCreatePaymentIntent,
  handleGetPaymentStatus,
  handleConfirmCheckout,
};
