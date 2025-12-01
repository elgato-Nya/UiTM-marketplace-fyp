import api from "../../../services/api";

/**
 * Order Service - API communication layer
 *
 * PURPOSE: Centralize all order-related API calls
 * PATTERN: Returns Axios responses directly (service doesn't handle Redux)
 * ERROR HANDLING: Axios interceptor in api/index.js handles errors globally
 */

const orderService = {
  /**
   * CREATE ORDER
   * @param {Object} orderData - Order creation payload
   * @param {Array} orderData.items - [{listingId, quantity}]
   * @param {Object} orderData.deliveryAddress - Full address object
   * @param {string} orderData.deliveryMethod - Delivery method
   * @param {string} orderData.paymentMethod - Payment method
   * @param {string} orderData.notes - Optional buyer notes
   * @returns {Promise<AxiosResponse>}
   */
  async createOrder(orderData) {
    return api.post("/orders", orderData);
  },

  /**
   * GET USER'S ORDERS (Buyer or Seller view)
   * @param {Object} params - Query parameters
   * @param {string} params.role - 'buyer' or 'seller' (perspective)
   * @param {number} params.page - Page number (default 1)
   * @param {number} params.limit - Items per page (default 20)
   * @param {string} params.status - Filter by order status
   * @param {string} params.paymentStatus - Filter by payment status
   * @param {string} params.deliveryStatus - Filter by delivery status
   * @param {string} params.startDate - ISO date string
   * @param {string} params.endDate - ISO date string
   * @param {string} params.sort - Sort field (e.g., '-createdAt')
   * @param {string} params.fields - Comma-separated fields to return
   * @returns {Promise<AxiosResponse>}
   */
  async getMyOrders(params = {}) {
    return await api.get("/orders/my-orders", { params });
  },

  /**
   * GET SELLER ORDERS (Merchant dashboard view)
   * @param {Object} params - Query parameters (same as getMyOrders)
   * @param {boolean} params.urgent - Filter urgent orders needing attention
   * @returns {Promise<AxiosResponse>}
   */
  async getSellerOrders(params = {}) {
    return await api.get("/orders/seller", { params });
  },

  /**
   * GET SINGLE ORDER BY ID
   * @param {string} orderId - MongoDB ObjectId
   * @param {Object} params - Query parameters
   * @param {string} params.fields - Comma-separated fields
   * @param {boolean} params.includeHistory - Include status history
   * @returns {Promise<AxiosResponse>}
   */
  async getOrderById(orderId, params = {}) {
    return await api.get(`/orders/${orderId}`, { params });
  },

  /**
   * UPDATE ORDER STATUS
   * @param {string} orderId - MongoDB ObjectId
   * @param {Object} data - Update payload
   * @param {string} data.status - New status
   * @param {string} data.notes - Optional status change notes
   * @returns {Promise<AxiosResponse>}
   */
  async updateOrderStatus(orderId, data) {
    return await api.patch(`/orders/status/${orderId}`, data);
  },

  /**
   * CANCEL ORDER
   * @param {string} orderId - MongoDB ObjectId
   * @param {Object} data - Cancellation payload
   * @param {string} data.reason - Cancel reason (from CANCEL_REASON enum)
   * @param {string} data.description - Optional detailed description
   * @returns {Promise<AxiosResponse>}
   */
  async cancelOrder(orderId, data) {
    return await api.patch(`/orders/cancel/${orderId}`, data);
  },

  /**
   * GET ORDER ANALYTICS
   * @param {Object} params - Query parameters
   * @param {string} params.period - 'day'|'week'|'month'|'year'
   * @returns {Promise<AxiosResponse>}
   */
  async getOrderAnalytics(params = {}) {
    return await api.get("/orders/analytics", { params });
  },

  /**
   * GET ORDERS BY STATUS (Admin only)
   * @param {string} status - Order status to filter
   * @param {Object} params - Pagination and sorting params
   * @returns {Promise<AxiosResponse>}
   */
  async getOrdersByStatus(status, params = {}) {
    return await api.get(`/orders/status/${status}`, { params });
  },
};

export default orderService;
