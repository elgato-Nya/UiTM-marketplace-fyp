/**
 * Admin Analytics Controller
 * Handles platform-wide analytics for admin dashboard
 */

const BaseController = require("../base.controller");
const {
  getPlatformAnalytics,
  getPlatformOverview,
  refreshPlatformAnalytics,
  getPendingVerifications,
} = require("../../services/analytic/platform.analytics.service");
const {
  getBulkMerchantAnalytics,
} = require("../../services/analytic/merchant.analytics.service");
const { User } = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");

class AdminAnalyticsController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get platform analytics for specific period
   * GET /api/analytics/admin/:period
   * @access Private - Admin only
   */
  getAnalyticsByPeriod = asyncHandler(async (req, res) => {
    const { period } = req.params;
    const adminLevel = req.user.adminLevel || "super";

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

    const analytics = await getPlatformAnalytics(period, adminLevel);

    this.logAction("get_platform_analytics", req.user.userId, {
      period,
      adminLevel,
      hasData: !!analytics.lastCalculated,
    });

    return this.sendSuccess(
      res,
      analytics,
      `Platform analytics for ${period} retrieved successfully`
    );
  });

  /**
   * Get platform overview (all periods)
   * GET /api/analytics/admin/overview
   * @access Private - Admin only
   */
  getOverview = asyncHandler(async (req, res) => {
    const adminLevel = req.user.adminLevel || "super";

    const overview = await getPlatformOverview(adminLevel);

    this.logAction("get_platform_overview", req.user.userId, {
      adminLevel,
    });

    return this.sendSuccess(
      res,
      overview,
      "Platform analytics overview retrieved successfully"
    );
  });

  /**
   * Refresh platform analytics manually
   * POST /api/analytics/admin/refresh
   * @access Private - Super Admin only
   */
  refreshAnalytics = asyncHandler(async (req, res) => {
    const { period = "all" } = sanitizeObject(req.body);
    const adminLevel = req.user.adminLevel || "super";

    // Only super admins can manually refresh
    if (adminLevel !== "super") {
      return this.sendError(
        res,
        "Only super administrators can refresh platform analytics",
        403,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

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

    const result = await refreshPlatformAnalytics(period);

    this.logAction("refresh_platform_analytics", req.user.userId, {
      period,
      success: true,
    });

    return this.sendSuccess(
      res,
      result,
      `Platform analytics refreshed successfully for ${period}`,
      200
    );
  });

  /**
   * Get pending merchant verifications alert
   * GET /api/analytics/admin/alerts/verifications
   * @access Private - Admin only
   */
  getPendingVerificationsAlert = asyncHandler(async (req, res) => {
    const count = await getPendingVerifications();

    this.logAction("get_pending_verifications_alert", req.user.userId, {
      count,
    });

    return this.sendSuccess(
      res,
      {
        pendingVerifications: count,
        requiresAction: count > 0,
        priority: count > 10 ? "high" : count > 5 ? "medium" : "low",
      },
      "Pending verifications count retrieved successfully"
    );
  });

  /**
   * Get top merchants by revenue
   * GET /api/analytics/admin/merchants/top
   * @access Private - Super Admin only (financial data)
   */
  getTopMerchants = asyncHandler(async (req, res) => {
    const adminLevel = req.user.adminLevel || "super";
    const { period = "week", limit = 10 } = sanitizeQuery(req.query);

    // Only super admins can see revenue data
    if (adminLevel !== "super") {
      return this.sendError(
        res,
        "Only super administrators can view merchant revenue data",
        403,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    // Get all merchants
    const merchants = await User.find({
      roles: "merchant",
      isActive: true,
    })
      .select("_id profile.username merchantDetails.shopName")
      .lean();

    const merchantIds = merchants.map((m) => m._id);

    // Get analytics for all merchants
    const analyticsData = await getBulkMerchantAnalytics(merchantIds, period);

    // Sort by revenue and limit
    const topMerchants = analyticsData
      .map((analytics) => {
        const merchant = merchants.find(
          (m) => m._id.toString() === analytics.merchantId.toString()
        );
        return {
          merchantId: analytics.merchantId,
          username: merchant?.profile?.username,
          shopName: merchant?.merchantDetails?.shopName,
          revenue: analytics.revenue.total,
          salesCount: analytics.sales.count,
          ordersTotal: analytics.orders.total,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    this.logAction("get_top_merchants", req.user.userId, {
      period,
      limit,
      resultCount: topMerchants.length,
    });

    return this.sendSuccess(
      res,
      {
        period,
        merchants: topMerchants,
        totalMerchants: merchants.length,
      },
      "Top merchants retrieved successfully"
    );
  });

  /**
   * Get platform health summary
   * GET /api/analytics/admin/health
   * @access Private - Admin only
   */
  getHealthSummary = asyncHandler(async (req, res) => {
    const adminLevel = req.user.adminLevel || "super";

    // Get week analytics for health check
    const weekAnalytics = await getPlatformAnalytics("week", adminLevel);

    const health = {
      activeUsers: weekAnalytics.users.activeToday,
      activeUsersPercentage:
        weekAnalytics.users.total > 0
          ? (
              (weekAnalytics.users.activeToday / weekAnalytics.users.total) *
              100
            ).toFixed(1)
          : 0,
      pendingVerifications: weekAnalytics.merchants.pendingVerification,
      suspendedMerchants: weekAnalytics.merchants.suspended,
      systemHealth:
        weekAnalytics.merchants.pendingVerification > 20 ||
        weekAnalytics.merchants.suspended > 10
          ? "warning"
          : "healthy",
      lastUpdated: weekAnalytics.lastCalculated,
    };

    this.logAction("get_platform_health", req.user.userId, {
      systemHealth: health.systemHealth,
    });

    return this.sendSuccess(
      res,
      health,
      "Platform health summary retrieved successfully"
    );
  });
}

module.exports = new AdminAnalyticsController();
