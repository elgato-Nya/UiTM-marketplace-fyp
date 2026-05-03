import api from "../../../services/api";

/**
 * Payout Service - API communication layer
 *
 * PURPOSE: Centralize all payout-related API calls
 * PATTERN: Returns Axios responses directly
 */

const payoutService = {
  // -------------------------------------------
  // Seller endpoints
  // -------------------------------------------

  async getBalance(params = {}) {
    return api.get("/payments/balance", { params });
  },

  async updatePayoutSettings(settingsData) {
    return api.patch("/payments/settings", settingsData);
  },

  async updateBankDetails(bankData) {
    return api.put("/payments/bank-details", bankData);
  },

  async requestPayout(payoutData = {}) {
    return api.post("/payments/request", payoutData);
  },

  async getPayoutHistory(params = {}) {
    return api.get("/payments/history", { params });
  },

  async getPayoutById(payoutId) {
    return api.get(`/payments/${payoutId}`);
  },

  async cancelPayout(payoutId) {
    return api.patch(`/payments/${payoutId}/cancel`);
  },

  // -------------------------------------------
  // Admin endpoints
  // -------------------------------------------

  async getPendingBankVerifications(params = {}) {
    return api.get("/payments/admin/pending-verifications", { params });
  },

  async getPendingPayouts(params = {}) {
    return api.get("/payments/admin/pending-payouts", { params });
  },

  async getSellerBalance(sellerId, params = {}) {
    return api.get(`/payments/admin/seller/${sellerId}`, { params });
  },

  async verifyBankDetails(sellerId) {
    return api.patch(`/payments/admin/verify/${sellerId}`);
  },

  async processPayout(payoutId, processData) {
    return api.patch(`/payments/admin/${payoutId}/process`, processData);
  },
};

export default payoutService;
