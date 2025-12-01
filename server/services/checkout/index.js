const {
  createCartCheckoutSession,
  createDirectCheckoutSession,
  getActiveSession,
  updateCheckoutSession,
  cancelCheckoutSession,
} = require("./checkout.service");

const { createPaymentIntent, getPaymentStatus } = require("./payment.service");

const {
  confirmCheckoutAndCreateOrders,
  createOrdersFromSession,
  clearCartAfterCheckout,
} = require("./checkout.order.service");

const {
  validateCheckoutItems,
  groupItemsBySeller,
  calculateCheckoutSummary,
  reserveStock,
  releaseStock,
  validateDeliveryAddress,
  checkPaymentMethodAllowed,
} = require("./checkout.helpers");

module.exports = {
  // Session management
  createCartCheckoutSession,
  createDirectCheckoutSession,
  getActiveSession,
  updateCheckoutSession,
  cancelCheckoutSession,

  // Payment operations
  createPaymentIntent,
  getPaymentStatus,

  // Order creation
  confirmCheckoutAndCreateOrders,
  createOrdersFromSession,
  clearCartAfterCheckout,

  // Helpers
  validateCheckoutItems,
  groupItemsBySeller,
  calculateCheckoutSummary,
  reserveStock,
  releaseStock,
  validateDeliveryAddress,
  checkPaymentMethodAllowed,
};
