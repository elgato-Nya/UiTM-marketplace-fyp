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
const logger = require("../../utils/logger");

const baseController = new BaseController();

/**
 * Get platform analytics for specific period
 * GET /api/analytics/admin/:period
 * @access Private - Admin only
 */
const handleGetAnalyticsByPeriod = asyncHandler(async (req, res) => {
  const { period } = req.params;
  const adminLevel = req.user.adminLevel || "super";

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

  const analytics = await getPlatformAnalytics(period, adminLevel);

  baseController.logAction("get_platform_analytics", req, {
    period,
    adminLevel,
    hasData: !!analytics.lastCalculated,
  });

  return baseController.sendSuccess(
    res,
    analytics,
    `Platform analytics for ${period} retrieved successfully`
  );
}, "get_platform_analytics");

/**
 * Get platform overview (all periods)
 * GET /api/analytics/admin/overview
 * @access Private - Admin only
 */
const handleGetOverview = asyncHandler(async (req, res) => {
  const adminLevel = req.user.adminLevel || "super";

  const overview = await getPlatformOverview(adminLevel);

  baseController.logAction("get_platform_overview", req, {
    adminLevel,
  });

  return baseController.sendSuccess(
    res,
    overview,
    "Platform analytics overview retrieved successfully"
  );
}, "get_platform_overview");

/**
 * Refresh platform analytics manually
 * POST /api/analytics/admin/refresh
 * @access Private - Super Admin only
 */
const handleRefreshAnalytics = asyncHandler(async (req, res) => {
  const { period = "all" } = sanitizeObject(req.body);
  const adminLevel = req.user.adminLevel || "super";

  // Only super admins can manually refresh
  if (adminLevel !== "super") {
    return baseController.sendError(
      res,
      "Only super administrators can refresh platform analytics",
      403,
      "INSUFFICIENT_PERMISSIONS"
    );
  }

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

  const result = await refreshPlatformAnalytics(period);

  baseController.logAction("refresh_platform_analytics", req, {
    period,
    success: true,
  });

  return baseController.sendSuccess(
    res,
    result,
    `Platform analytics refreshed successfully for ${period}`,
    200
  );
}, "refresh_platform_analytics");

/**
 * Get pending merchant verifications alert
 * GET /api/analytics/admin/alerts/verifications
 * @access Private - Admin only
 */
const handleGetPendingVerificationsAlert = asyncHandler(async (req, res) => {
  const count = await getPendingVerifications();

  baseController.logAction("get_pending_verifications_alert", req, {
    count,
  });

  return baseController.sendSuccess(
    res,
    {
      pendingVerifications: count,
      requiresAction: count > 0,
      priority: count > 10 ? "high" : count > 5 ? "medium" : "low",
    },
    "Pending verifications count retrieved successfully"
  );
}, "get_pending_verifications_alert");

/**
 * Get top merchants by revenue
 * GET /api/analytics/admin/merchants/top
 * @access Private - Super Admin only (financial data)
 */
const handleGetTopMerchants = asyncHandler(async (req, res) => {
  const adminLevel = req.user.adminLevel || "super";
  const { period = "week", limit = 10 } = sanitizeQuery(req.query);

  // Only super admins can see revenue data
  if (adminLevel !== "super") {
    return baseController.sendError(
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

  baseController.logAction("get_top_merchants", req, {
    period,
    limit,
    resultCount: topMerchants.length,
  });

  return baseController.sendSuccess(
    res,
    {
      period,
      merchants: topMerchants,
      totalMerchants: merchants.length,
    },
    "Top merchants retrieved successfully"
  );
}, "get_top_merchants");
/**
 * Get platform health summary
 * GET /api/analytics/admin/health
 * @access Private - Admin only
 */
const handleGetHealthSummary = asyncHandler(async (req, res) => {
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

  baseController.logAction("get_platform_health", req, {
    systemHealth: health.systemHealth,
  });

  return baseController.sendSuccess(
    res,
    health,
    "Platform health summary retrieved successfully"
  );
}, "get_platform_health");

/**
 * Get public platform statistics
 * GET /api/analytics/public/stats
 * @access Public - No authentication required
 * @returns Safe, non-sensitive platform statistics for homepage
 */
const handleGetPublicStats = asyncHandler(async (req, res) => {
  // Get week analytics for most recent data
  // Use 'moderator' level to exclude sensitive financial data
  const weekAnalytics = await getPlatformAnalytics("week", "moderator");

  // Log what we got for debugging
  logger.info("Public stats request", {
    hasAnalytics: !!weekAnalytics,
    totalUsers: weekAnalytics?.users?.total,
    totalListings: weekAnalytics?.listings?.active,
    listingsObject: weekAnalytics?.listings,
    totalMerchants: weekAnalytics?.merchants?.verified,
  });

  // Return only safe, public-facing statistics
  const publicStats = {
    totalUsers: weekAnalytics?.users?.total || 0,
    totalListings: weekAnalytics?.listings?.active || 0,
    totalMerchants: weekAnalytics?.merchants?.verified || 0,
    activeMerchants: weekAnalytics?.merchants?.active || 0,
    // Optional: Add some rounded/approximated numbers for marketing
    approximations: {
      users: Math.floor((weekAnalytics?.users?.total || 0) / 100) * 100, // Round to nearest 100
      listings: Math.floor((weekAnalytics?.listings?.active || 0) / 100) * 100,
    },
    lastUpdated: weekAnalytics?.lastCalculated || new Date(),
  };

  return baseController.sendSuccess(
    res,
    publicStats,
    "Public platform statistics retrieved successfully"
  );
}, "get_public_stats");

module.exports = {
  handleGetAnalyticsByPeriod,
  handleGetOverview,
  handleRefreshAnalytics,
  handleGetPendingVerificationsAlert,
  handleGetTopMerchants,
  handleGetHealthSummary,
  handleGetPublicStats,
};
