import api from "../../../services/api";

/**
 * Checkout Service
 *
 * PURPOSE: Handle all checkout-related API calls
 * PATTERN: Follows your existing service structure
 * ENDPOINTS: 8 checkout endpoints from backend
 */

export const checkoutService = {
  /**
   * Create checkout session from cart
   * @returns {Promise} Session data
   */
  createSessionFromCart: () => {
    return api.post("/checkout/session/cart");
  },

  /**
   * Create checkout session from direct purchase (Buy Now)
   * @param {Object} data - { listingId, quantity, variantId? }
   * @returns {Promise} Session data
   */
  createSessionFromListing: (data) => {
    return api.post("/checkout/session/direct", data);
  },

  /**
   * Get active checkout session
   * @returns {Promise} Session data or null
   */
  getActiveSession: () => {
    return api.get("/checkout/session");
  },

  /**
   * Update checkout session with delivery/payment details
   * @param {String} sessionId - Session ID
   * @param {Object} data - { deliveryMethod, deliveryAddress, paymentMethod, addressId }
   * @returns {Promise} Updated session data
   */
  updateSession: (sessionId, data) => {
    return api.put(`/checkout/session/${sessionId}`, data);
  },

  /**
   * Cancel checkout session
   * @param {String} sessionId - Session ID
   * @returns {Promise} Success response
   */
  cancelSession: (sessionId) => {
    return api.delete(`/checkout/session/${sessionId}`);
  },

  /**
   * Create Stripe payment intent
   * @param {String} sessionId - Session ID
   * @returns {Promise} { clientSecret, paymentIntentId }
   */
  createPaymentIntent: (sessionId) => {
    return api.post("/checkout/payment-intent", { sessionId });
  },

  /**
   * Create a ToyyibPay bill for an order
   * @param {String} orderId - Order ID
   * @param {Object} data - Bill payload overrides
   * @returns {Promise} Bill creation response
   */
  createOrderBill: (orderId, data = {}) => {
    return api.post(`/payments/orders/${orderId}/bill`, data);
  },

  /**
   * Retry a ToyyibPay payment by creating a fresh bill attempt
   * @param {String} orderId - Order ID
   * @returns {Promise} Retry bill response
   */
  retryOrderPayment: (orderId) => {
    return api.post(`/payments/orders/${orderId}/retry`);
  },

  getOrderPaymentStatus: (orderId) => {
    return api.get(`/payments/orders/${orderId}/status`);
  },

  /**
   * Get payment status
   * @param {String} sessionId - Session ID
   * @returns {Promise} Payment status data
   */
  getPaymentStatus: (sessionId) => {
    return api.get(`/checkout/payment-status/${sessionId}`);
  },

  /**
   * Confirm checkout and create orders
   * @param {String} sessionId - Session ID
   * @returns {Promise} { orders: Array, clearedFromCart: Boolean }
   */
  confirmCheckout: (sessionId, idempotencyKey) => {
    return api.post(`/checkout/confirm/${sessionId}`, { idempotencyKey });
  },
};
