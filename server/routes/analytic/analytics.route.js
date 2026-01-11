/**
 * Analytics Routes
 * Endpoints for merchant and admin analytics dashboards
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const express = require("express");
const router = express.Router();
const {
  protect: authenticate,
  authorize,
} = require("../../middleware/auth/auth.middleware");
const {
  refreshLimiter,
  adminRefreshLimiter,
} = require("../../middleware/limiters.middleware");

// Controllers
const {
  handleGetAnalyticsByPeriod: getMerchantAnalyticsByPeriod,
  handleGetOverview: getMerchantOverview,
  handleRefreshAnalytics: refreshMerchantAnalytics,
  handleGetQuickStats: getMerchantQuickStats,
} = require("../../controllers/analytic/merchant.analytics.controller");
const {
  handleGetAnalyticsByPeriod: getAdminAnalyticsByPeriod,
  handleGetOverview: getAdminOverview,
  handleRefreshAnalytics: refreshAdminAnalytics,
  handleGetPendingVerificationsAlert,
  handleGetTopMerchants,
  handleGetHealthSummary,
  handleGetPublicStats,
} = require("../../controllers/analytic/admin.analytics.controller");

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/analytics/public/stats
 * @desc    Get public platform statistics (no auth required)
 * @access  Public
 * @returns Basic platform stats for homepage/marketing
 */
router.get("/public/stats", handleGetPublicStats);

// ==================== MERCHANT ROUTES ====================
// Prefix: /api/analytics/merchant

/**
 * @route   GET /api/analytics/merchant/overview
 * @desc    Get merchant analytics overview (all periods)
 * @access  Private - Merchant only
 */
router.get(
  "/merchant/overview",
  authenticate,
  authorize(["merchant"]),
  getMerchantOverview
);

/**
 * @route   GET /api/analytics/merchant/stats
 * @desc    Get quick merchant stats (for dashboard widgets)
 * @access  Private - Merchant only
 */
router.get(
  "/merchant/stats",
  authenticate,
  authorize(["merchant"]),
  getMerchantQuickStats
);

/**
 * @route   GET /api/analytics/merchant/:period
 * @desc    Get merchant analytics for specific period (week/month/year)
 * @access  Private - Merchant only
 */
router.get(
  "/merchant/:period",
  authenticate,
  authorize(["merchant"]),
  getMerchantAnalyticsByPeriod
);

/**
 * @route   POST /api/analytics/merchant/refresh
 * @desc    Manually refresh merchant analytics
 * @access  Private - Merchant only
 * @limit   Once per 5 minutes
 */
router.post(
  "/merchant/refresh",
  authenticate,
  authorize(["merchant"]),
  refreshLimiter,
  refreshMerchantAnalytics
);

// ==================== ADMIN ROUTES ====================
// Prefix: /api/analytics/admin

/**
 * @route   GET /api/analytics/admin/overview
 * @desc    Get platform analytics overview (all periods)
 * @access  Private - Admin only
 */
router.get(
  "/admin/overview",
  authenticate,
  authorize(["admin"]),
  getAdminOverview
);

/**
 * @route   GET /api/analytics/admin/health
 * @desc    Get platform health summary
 * @access  Private - Admin only
 */
router.get(
  "/admin/health",
  authenticate,
  authorize(["admin"]),
  handleGetHealthSummary
);

/**
 * @route   GET /api/analytics/admin/alerts/verifications
 * @desc    Get pending merchant verifications count
 * @access  Private - Admin only
 */
router.get(
  "/admin/alerts/verifications",
  authenticate,
  authorize(["admin"]),
  handleGetPendingVerificationsAlert
);

/**
 * @route   GET /api/analytics/admin/merchants/top
 * @desc    Get top merchants by revenue
 * @access  Private - Super Admin only
 */
router.get(
  "/admin/merchants/top",
  authenticate,
  authorize(["admin"]),
  handleGetTopMerchants
);

/**
 * @route   GET /api/analytics/admin/:period
 * @desc    Get platform analytics for specific period (week/month/year)
 * @access  Private - Admin only
 */
router.get(
  "/admin/:period",
  authenticate,
  authorize(["admin"]),
  getAdminAnalyticsByPeriod
);

/**
 * @route   POST /api/analytics/admin/refresh
 * @desc    Manually refresh platform analytics
 * @access  Private - Super Admin only
 * @limit   3 times per 10 minutes
 */
router.post(
  "/admin/refresh",
  authenticate,
  authorize(["admin"]),
  adminRefreshLimiter,
  refreshAdminAnalytics
);

module.exports = router;
