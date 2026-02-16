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
    return api.get("/payouts/balance", { params });
  },

  async updatePayoutSettings(settingsData) {
    return api.patch("/payouts/settings", settingsData);
  },

  async updateBankDetails(bankData) {
    return api.put("/payouts/bank-details", bankData);
  },

  async requestPayout(payoutData = {}) {
    return api.post("/payouts/request", payoutData);
  },

  async getPayoutHistory(params = {}) {
    return api.get("/payouts/history", { params });
  },

  async getPayoutById(payoutId) {
    return api.get(`/payouts/${payoutId}`);
  },

  async cancelPayout(payoutId) {
    return api.patch(`/payouts/${payoutId}/cancel`);
  },

  // -------------------------------------------
  // Admin endpoints
  // -------------------------------------------

  async getPendingBankVerifications(params = {}) {
    return api.get("/payouts/admin/pending-verifications", { params });
  },

  async getPendingPayouts(params = {}) {
    return api.get("/payouts/admin/pending-payouts", { params });
  },

  async getSellerBalance(sellerId, params = {}) {
    return api.get(`/payouts/admin/seller/${sellerId}`, { params });
  },

  async verifyBankDetails(sellerId) {
    return api.patch(`/payouts/admin/verify/${sellerId}`);
  },

  async processPayout(payoutId, processData) {
    return api.patch(`/payouts/admin/${payoutId}/process`, processData);
  },
};

export default payoutService;
