import api from "../../../services/api";

/**
 * Admin Dashboard Service
 *
 * PURPOSE: API integration for admin dashboard analytics
 * ENDPOINTS: /api/analytics/admin/*
 * PATTERN: Follows existing analyticsService.js pattern
 */

const adminDashboardService = {
  /**
   * Get platform overview (all periods: week/month/year)
   * @returns {Promise<Object>} Platform overview data
   */
  async getOverview() {
    const response = await api.get("/analytics/admin/overview");
    return response.data;
  },

  /**
   * Get platform analytics for specific period
   * @param {string} period - 'week', 'month', or 'year'
   * @returns {Promise<Object>} Analytics data for period
   */
  async getAnalyticsByPeriod(period = "week") {
    const response = await api.get(`/analytics/admin/${period}`);
    return response.data;
  },

  /**
   * Get system health summary
   * @returns {Promise<Object>} Health summary data
   */
  async getHealthSummary() {
    const response = await api.get("/analytics/admin/health");
    return response.data;
  },

  /**
   * Get pending merchant verifications count
   * @returns {Promise<Object>} Pending verifications alert data
   */
  async getPendingVerifications() {
    const response = await api.get("/analytics/admin/alerts/verifications");
    return response.data;
  },

  /**
   * Get top merchants by revenue (super admin only)
   * @param {string} period - 'week', 'month', or 'year'
   * @param {number} limit - Number of top merchants to return
   * @returns {Promise<Object>} Top merchants data
   */
  async getTopMerchants(period = "week", limit = 10) {
    const response = await api.get("/analytics/admin/merchants/top", {
      params: { period, limit },
    });
    return response.data;
  },

  /**
   * Manually refresh platform analytics
   * Rate limited: Max 3 times per 10 minutes
   * @param {string} period - 'week', 'month', 'year', or 'all'
   * @returns {Promise<Object>} Refresh result
   */
  async refreshAnalytics(period = "all") {
    const response = await api.post("/analytics/admin/refresh", { period });
    return response.data;
  },
};

export default adminDashboardService;
