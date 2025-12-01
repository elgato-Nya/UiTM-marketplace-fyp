import api from "../../../services/api";

/**
 * Analytics Service - API communication layer
 *
 * PURPOSE: Centralize all analytics-related API calls
 * PATTERN: Returns Axios responses directly (service doesn't handle Redux)
 * ERROR HANDLING: Axios interceptor in api/index.js handles errors globally
 *
 * IMPORTANT: Server uses sendSuccess() which spreads data directly into response
 * Response structure: { success, message, ...data, timestamp }
 */

const analyticsService = {
  /**
   * GET MERCHANT ANALYTICS BY PERIOD
   * @param {string} period - 'week' | 'month' | 'year'
   * @returns {Promise<AxiosResponse>}
   *
   * Server Response Structure:
   * {
   *   success: true,
   *   message: "Merchant analytics for {period} retrieved successfully",
   *   merchantId: "...",
   *   period: "week",
   *   revenue: { total, byCategory, highestDay, lowestDay, growthRate },
   *   sales: { count, trend },
   *   orders: { total, pending, confirmed, completed, cancelled, statusDistribution, averageValue },
   *   listings: { totalActive, totalInactive, lowStock, topSelling },
   *   conversion: { views, purchases, rate },
   *   lastCalculated: "...",
   *   timestamp: "..."
   * }
   */
  async getMerchantAnalyticsByPeriod(period = "week") {
    return api.get(`/analytics/merchant/${period}`);
  },

  /**
   * GET MERCHANT OVERVIEW (ALL PERIODS)
   * @returns {Promise<AxiosResponse>}
   *
   * Server Response Structure:
   * {
   *   success: true,
   *   message: "Merchant analytics overview retrieved successfully",
   *   week: { ...analytics data },
   *   month: { ...analytics data },
   *   year: { ...analytics data },
   *   timestamp: "..."
   * }
   */
  async getMerchantOverview() {
    return api.get("/analytics/merchant/overview");
  },

  /**
   * GET QUICK STATS (WEEK SUMMARY)
   * @returns {Promise<AxiosResponse>}
   *
   * Server Response Structure:
   * {
   *   success: true,
   *   message: "Merchant quick stats retrieved successfully",
   *   revenue: { total, growthRate },
   *   sales: { count },
   *   orders: { pending, completed },
   *   listings: { lowStock },
   *   lastUpdated: "...",
   *   timestamp: "..."
   * }
   */
  async getMerchantQuickStats() {
    return api.get("/analytics/merchant/stats");
  },

  /**
   * REFRESH MERCHANT ANALYTICS MANUALLY
   * @param {string} period - 'week' | 'month' | 'year' | 'all'
   * @returns {Promise<AxiosResponse>}
   *
   * Rate Limited: Once per 5 minutes per merchant
   */
  async refreshMerchantAnalytics(period = "all") {
    return api.post("/analytics/merchant/refresh", { period });
  },

  // Admin Analytics (optional - if needed later)
  async getAdminStats(params = {}) {
    return api.get("/analytics/admin/stats", { params });
  },

  async getAdminAnalyticsByPeriod(period = "week") {
    return api.get(`/analytics/admin/${period}`);
  },
};

export default analyticsService;
