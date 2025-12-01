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

class MerchantAnalyticsController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get merchant analytics for specific period
   * GET /api/analytics/merchant/:period
   * @access Private - Merchant only
   */
  getAnalyticsByPeriod = asyncHandler(async (req, res) => {
    const { period } = req.params;
    const merchantId = req.user._id; // Changed from req.user.userId to req.user._id

    // Validate period
    const validPeriods = ["week", "month", "year"];
    if (!validPeriods.includes(period)) {
      return this.sendError(
        res,
        "Invalid period. Must be week, month, or year",
        400,
        "INVALID_PERIOD"
      );
    }

    const analytics = await getMerchantAnalytics(merchantId, period);

    this.logAction("get_merchant_analytics", req.user._id, {
      period,
      hasData: !!analytics.lastCalculated,
    });

    return this.sendSuccess(
      res,
      analytics,
      `Merchant analytics for ${period} retrieved successfully`
    );
  });

  /**
   * Get merchant overview (all periods)
   * GET /api/analytics/merchant/overview
   * @access Private - Merchant only
   */
  getOverview = asyncHandler(async (req, res) => {
    const merchantId = req.user._id; // Changed from req.user.userId to req.user._id

    const overview = await getMerchantOverview(merchantId);

    this.logAction("get_merchant_overview", req.user._id, {
      hasWeekData: !!overview.week.lastCalculated,
      hasMonthData: !!overview.month.lastCalculated,
      hasYearData: !!overview.year.lastCalculated,
    });

    return this.sendSuccess(
      res,
      overview,
      "Merchant analytics overview retrieved successfully"
    );
  });

  /**
   * Refresh merchant analytics manually
   * POST /api/analytics/merchant/refresh
   * @access Private - Merchant only
   * @rateLimit Once per 5 minutes per merchant
   */
  refreshAnalytics = asyncHandler(async (req, res) => {
    const merchantId = req.user._id; // Changed from req.user.userId to req.user._id
    const { period = "all" } = sanitizeObject(req.body);

    // Validate period
    const validPeriods = ["week", "month", "year", "all"];
    if (!validPeriods.includes(period)) {
      return this.sendError(
        res,
        "Invalid period. Must be week, month, year, or all",
        400,
        "INVALID_PERIOD"
      );
    }

    const result = await refreshMerchantAnalytics(merchantId, period);

    this.logAction("refresh_merchant_analytics", req.user._id, {
      period,
      success: true,
    });

    return this.sendSuccess(
      res,
      result,
      `Merchant analytics refreshed successfully for ${period}`,
      200
    );
  });

  /**
   * Get current merchant stats (quick summary)
   * GET /api/analytics/merchant/stats
   * @access Private - Merchant only
   */
  getQuickStats = asyncHandler(async (req, res) => {
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

    this.logAction("get_merchant_quick_stats", req.user._id);

    return this.sendSuccess(
      res,
      quickStats,
      "Merchant quick stats retrieved successfully"
    );
  });
}

module.exports = new MerchantAnalyticsController();
