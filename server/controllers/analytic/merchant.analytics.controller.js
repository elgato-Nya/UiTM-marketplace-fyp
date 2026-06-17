/**
 * Merchant Analytics Controller
 * Handles merchant dashboard analytics API requests
 */

const BaseController = require("../base.controller");
const {
  getMerchantAnalytics,
  getMerchantOverview,
  getMerchantLowStockInventory,
  refreshMerchantAnalytics,
} = require("../../services/analytic/merchant.analytics.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject } = require("../../utils/sanitizer");
const logger = require("../../utils/logger");

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

  baseController.logAction("get_merchant_analytics", req, {
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

  baseController.logAction("get_merchant_overview", req, {
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

  baseController.logAction("refresh_merchant_analytics", req, {
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

  baseController.logAction("get_merchant_quick_stats", req);

  return baseController.sendSuccess(
    res,
    quickStats,
    "Merchant quick stats retrieved successfully"
  );
}, "get_merchant_quick_stats");

/**
 * Get paginated low-stock inventory.
 * GET /api/analytics/merchant/low-stock
 * @access Private - Merchant only
 */
const handleGetLowStockInventory = asyncHandler(async (req, res) => {
  const merchantId = req.user._id;
  const { page = 1, limit = 10, threshold } = sanitizeObject(req.query);

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const parsedThreshold =
    threshold !== undefined ? parseInt(threshold, 10) : undefined;

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return baseController.sendError(
      res,
      "Page must be a positive integer",
      400,
      "INVALID_PAGE"
    );
  }

  if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return baseController.sendError(
      res,
      "Limit must be between 1 and 100",
      400,
      "INVALID_LIMIT"
    );
  }

  if (
    threshold !== undefined &&
    (Number.isNaN(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 100)
  ) {
    return baseController.sendError(
      res,
      "Threshold must be between 1 and 100",
      400,
      "INVALID_THRESHOLD"
    );
  }

  const lowStockInventory = await getMerchantLowStockInventory(merchantId, {
    page: parsedPage,
    limit: parsedLimit,
    threshold: parsedThreshold,
  });

  baseController.logAction("get_merchant_low_stock_inventory", req, {
    page: parsedPage,
    limit: parsedLimit,
    threshold: lowStockInventory.threshold,
    totalItems: lowStockInventory.pagination.totalItems,
  });

  return baseController.sendSuccess(
    res,
    lowStockInventory,
    "Merchant low-stock inventory retrieved successfully"
  );
}, "get_merchant_low_stock_inventory");

module.exports = {
  handleGetAnalyticsByPeriod,
  handleGetOverview,
  handleRefreshAnalytics,
  handleGetQuickStats,
  handleGetLowStockInventory,
};
