/**
 * Merchant Analytics Controller
 * Handles merchant dashboard analytics API requests
 */

const BaseController = require("../base.controller");
const {
  getMerchantAnalytics,
  getMerchantOverview,
  refreshMerchantAnalytics,
} = require("../../services/analytic/merchant.analytics.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject } = require("../../utils/sanitizer");
const logger = require("../../config/logger.config");

const baseController = new BaseController();

/**
 * Get merchant analytics for specific period
 * GET /api/analytics/merchant/:period
 * @access Private - Merchant only
 */
const handleGetAnalyticsByPeriod = asyncHandler(async (req, res) => {
  const { period } = req.params;
  const merchantId = req.user._id; // Changed from req.user.userId to req.user._id

  // Validate period
  const validPeriods = ["week", "month", "year"];
  if (!validPeriods.includes(period)) {
    return baseController.sendError(
      res,
      "Invalid period. Must be week, month, or year",
      400,
      "INVALID_PERIOD"
    );
  }

  const analytics = await getMerchantAnalytics(merchantId, period);

  baseController.logAction("get_merchant_analytics", req.user._id, {
    period,
    hasData: !!analytics.lastCalculated,
  });

  return baseController.sendSuccess(
    res,
    analytics,
    `Merchant analytics for ${period} retrieved successfully`
  );
}, "get_merchant_analytics");

/**
 * Get merchant overview (all periods)
 * GET /api/analytics/merchant/overview
 * @access Private - Merchant only
 */
const handleGetOverview = asyncHandler(async (req, res) => {
  const merchantId = req.user._id; // Changed from req.user.userId to req.user._id

  const overview = await getMerchantOverview(merchantId);

  baseController.logAction("get_merchant_overview", req.user._id, {
    hasWeekData: !!overview.week.lastCalculated,
    hasMonthData: !!overview.month.lastCalculated,
    hasYearData: !!overview.year.lastCalculated,
  });

  return baseController.sendSuccess(
    res,
    overview,
    "Merchant analytics overview retrieved successfully"
  );
}, "get_merchant_overview");

/**
 * Refresh merchant analytics manually
 * POST /api/analytics/merchant/refresh
 * @access Private - Merchant only
 * @rateLimit Once per 5 minutes per merchant
 */
const handleRefreshAnalytics = asyncHandler(async (req, res) => {
  const merchantId = req.user?._id;

  if (!merchantId) {
    logger.error("Refresh analytics called without valid merchant ID", {
      hasUser: !!req.user,
      userId: req.user?.userId,
      userKeys: req.user ? Object.keys(req.user) : [],
    });
    return baseController.sendError(
      res,
      "Merchant ID not found in request",
      400,
      "MISSING_MERCHANT_ID"
    );
  }

  const { period = "all" } = sanitizeObject(req.body);

  // Validate period
  const validPeriods = ["week", "month", "year", "all"];
  if (!validPeriods.includes(period)) {
    return baseController.sendError(
      res,
      "Invalid period. Must be week, month, year, or all",
      400,
      "INVALID_PERIOD"
    );
  }

  const result = await refreshMerchantAnalytics(merchantId, period);

  baseController.logAction("refresh_merchant_analytics", req.user._id, {
    period,
    success: true,
  });

  return baseController.sendSuccess(
    res,
    result,
    `Merchant analytics refreshed successfully for ${period}`,
    200
  );
}, "refresh_merchant_analytics");

/**
 * Get current merchant stats (quick summary)
 * GET /api/analytics/merchant/stats
 * @access Private - Merchant only
 */
const handleGetQuickStats = asyncHandler(async (req, res) => {
  const merchantId = req.user._id; // Changed from req.user.userId to req.user._id

  // Get week analytics for quick stats
  const weekAnalytics = await getMerchantAnalytics(merchantId, "week");

  const quickStats = {
    revenue: {
      total: weekAnalytics.revenue.total,
      growthRate: weekAnalytics.revenue.growthRate,
    },
    sales: {
      count: weekAnalytics.sales.count,
    },
    orders: {
      pending: weekAnalytics.orders.pending,
      completed: weekAnalytics.orders.completed,
    },
    listings: {
      lowStock: weekAnalytics.listings.lowStock,
    },
    lastUpdated: weekAnalytics.lastCalculated,
  };

  baseController.logAction("get_merchant_quick_stats", req.user._id);

  return baseController.sendSuccess(
    res,
    quickStats,
    "Merchant quick stats retrieved successfully"
  );
}, "get_merchant_quick_stats");

module.exports = {
  handleGetAnalyticsByPeriod,
  handleGetOverview,
  handleRefreshAnalytics,
  handleGetQuickStats,
};
