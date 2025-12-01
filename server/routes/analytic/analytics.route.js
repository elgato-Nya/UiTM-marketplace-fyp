/**
 * Analytics Routes
 * Endpoints for merchant and admin analytics dashboards
 */

const express = require("express");
const router = express.Router();
const {
  protect: authenticate,
  authorize,
} = require("../../middleware/auth/auth.middleware");
const { rateLimit } = require("express-rate-limit");

// Controllers
const merchantAnalyticsController = require("../../controllers/analytic/merchant.analytics.controller");
const adminAnalyticsController = require("../../controllers/analytic/admin.analytics.controller");

// ==================== RATE LIMITERS ====================

// Merchant refresh: Max once per 5 minutes
const merchantRefreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1, // 1 request per window
  message: {
    success: false,
    message: "Analytics can only be refreshed once every 5 minutes",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID as key for per-user limiting
  keyGenerator: (req) => req.user.userId.toString(),
});

// Admin refresh: Max 3 times per 10 minutes
const adminRefreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    message: "Platform analytics can only be refreshed 3 times per 10 minutes",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.userId.toString(),
});

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
  merchantAnalyticsController.getOverview
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
  merchantAnalyticsController.getQuickStats
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
  merchantAnalyticsController.getAnalyticsByPeriod
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
  merchantRefreshLimiter,
  merchantAnalyticsController.refreshAnalytics
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
  adminAnalyticsController.getOverview
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
  adminAnalyticsController.getHealthSummary
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
  adminAnalyticsController.getPendingVerificationsAlert
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
  adminAnalyticsController.getTopMerchants
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
  adminAnalyticsController.getAnalyticsByPeriod
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
  adminAnalyticsController.refreshAnalytics
);

module.exports = router;
