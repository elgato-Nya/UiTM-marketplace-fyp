/**
 * Merchant Analytics Service
 * Business logic for calculating and managing merchant dashboard analytics
 */

const { MerchantAnalytics } = require("../../models/analytic");
const mongoose = require("mongoose");
const {
  getDateRange,
  calculateGrowthRate,
  calculateMerchantRevenue,
  calculateRevenueByCategory,
  findBestWorstDays,
  calculateSalesTrend,
  countOrdersByStatus,
  calculateAverageOrderValue,
  getTopSellingProducts,
  countMerchantListings,
  countLowStockProducts,
} = require("./aggregations");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const logger = require("../../utils/logger");

/**
 * Validate merchantId before processing
 */
const validateMerchantId = (merchantId) => {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(merchantId)) {
    throw new Error("Invalid Merchant ID format");
  }
};

/**
 * Calculate and save merchant analytics
 * Called by scheduled job every 15 minutes
 * @param {ObjectId} merchantId - Merchant user ID
 * @param {string} period - 'week', 'month', 'year'
 */
const calculateMerchantAnalytics = async (merchantId, period = "week") => {
  try {
    // Validate input
    validateMerchantId(merchantId);

    const { start, end, previous } = getDateRange(period);

    // Determine days for sales trend based on period
    const trendDays = period === "week" ? 7 : period === "month" ? 30 : 365;

    // Calculate current period metrics
    const [
      revenue,
      revenueByCategory,
      bestWorstDays,
      salesTrend,
      orderStats,
      avgOrderValue,
      topProducts,
      listingCounts,
      lowStockCount,
    ] = await Promise.all([
      calculateMerchantRevenue(merchantId, start, end),
      calculateRevenueByCategory(merchantId, start, end),
      findBestWorstDays(merchantId, start, end),
      calculateSalesTrend(merchantId, trendDays),
      countOrdersByStatus(merchantId, start, end),
      calculateAverageOrderValue(merchantId, start, end),
      getTopSellingProducts(merchantId, 10),
      countMerchantListings(merchantId),
      countLowStockProducts(merchantId),
    ]);

    // Calculate previous period revenue for growth rate
    const previousRevenue = await calculateMerchantRevenue(
      merchantId,
      previous,
      start
    );

    const growthRate = calculateGrowthRate(
      revenue.total,
      previousRevenue.total
    );

    // Build analytics document
    const analyticsData = {
      merchantId,
      period,
      startDate: start,
      endDate: end,

      // Revenue metrics
      revenue: {
        total: revenue.total,
        byCategory: revenueByCategory,
        highestDay: bestWorstDays.highestDay,
        lowestDay: bestWorstDays.lowestDay,
        growthRate,
      },

      // Sales metrics
      sales: {
        count: revenue.count,
        trend: salesTrend,
      },

      // Order metrics
      orders: {
        total: orderStats.total,
        pending: orderStats.pending,
        confirmed: orderStats.confirmed,
        completed: orderStats.completed,
        cancelled: orderStats.cancelled,
        statusDistribution: orderStats.statusDistribution,
        averageValue: avgOrderValue,
      },

      // Listing metrics
      listings: {
        totalActive: listingCounts.totalActive,
        totalInactive: listingCounts.totalInactive,
        lowStock: lowStockCount,
        topSelling: topProducts,
      },

      // Conversion metrics (basic - can be enhanced later)
      conversion: {
        views: 0, // TODO: Implement view tracking
        purchases: revenue.count,
        rate: 0, // TODO: Calculate when views available
      },

      lastCalculated: new Date(),
    };

    // Upsert analytics (update if exists, insert if new)
    const result = await MerchantAnalytics.findOneAndUpdate(
      { merchantId, period },
      analyticsData,
      { upsert: true, new: true, runValidators: true }
    );

    // Don't log individual success, only errors
    return result;
  } catch (error) {
    logger.error("Error calculating merchant analytics", {
      merchantId: String(merchantId),
      period,
      error: error.message,
      stack: error.stack,
    });
    throw handleServiceError(error, "calculate merchant analytics");
  }
};

/**
 * Get merchant analytics by period
 * @param {ObjectId} merchantId - Merchant user ID
 * @param {string} period - 'week', 'month', 'year'
 * @returns {Object} Analytics data or empty structure
 */
const getMerchantAnalytics = async (merchantId, period = "week") => {
  try {
    // Validate input
    validateMerchantId(merchantId);

    const analytics = await MerchantAnalytics.findOne({
      merchantId,
      period,
    }).lean();

    if (!analytics) {
      // Return empty structure if no data yet
      logger.info("No analytics found for merchant, returning empty data", {
        merchantId: String(merchantId),
        period,
      });

      return {
        merchantId,
        period,
        revenue: {
          total: 0,
          byCategory: [],
          highestDay: { date: null, amount: 0 },
          lowestDay: { date: null, amount: 0 },
          growthRate: 0,
        },
        sales: { count: 0, trend: [] },
        orders: {
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          statusDistribution: {},
          averageValue: 0,
        },
        listings: {
          totalActive: 0,
          totalInactive: 0,
          lowStock: 0,
          topSelling: [],
        },
        conversion: { views: 0, purchases: 0, rate: 0 },
        lastCalculated: null,
      };
    }

    return analytics;
  } catch (error) {
    logger.error("Error fetching merchant analytics", {
      merchantId: String(merchantId),
      period,
      error: error.message,
    });
    throw handleServiceError(error, "fetch merchant analytics");
  }
};

/**
 * Get merchant overview (summary of all periods)
 * @param {ObjectId} merchantId - Merchant user ID
 * @returns {Object} Overview with week, month, year data
 */
const getMerchantOverview = async (merchantId) => {
  try {
    // Validate input
    validateMerchantId(merchantId);

    const [weekData, monthData, yearData] = await Promise.all([
      getMerchantAnalytics(merchantId, "week"),
      getMerchantAnalytics(merchantId, "month"),
      getMerchantAnalytics(merchantId, "year"),
    ]);

    return {
      merchantId,
      week: weekData,
      month: monthData,
      year: yearData,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error("Error fetching merchant overview", {
      merchantId: String(merchantId),
      error: error.message,
    });
    throw handleServiceError(error, "fetch merchant overview");
  }
};

/**
 * Refresh merchant analytics manually (rate-limited in controller)
 * @param {ObjectId} merchantId - Merchant user ID
 * @param {string} period - 'week', 'month', 'year', or 'all'
 * @returns {Object} Updated analytics
 */
const refreshMerchantAnalytics = async (merchantId, period = "all") => {
  try {
    // Validate input
    validateMerchantId(merchantId);

    if (period === "all") {
      // Recalculate all periods
      const [week, month, year] = await Promise.all([
        calculateMerchantAnalytics(merchantId, "week"),
        calculateMerchantAnalytics(merchantId, "month"),
        calculateMerchantAnalytics(merchantId, "year"),
      ]);

      logger.info("All merchant analytics refreshed", {
        merchantId: String(merchantId),
      });

      return { week, month, year };
    } else {
      // Recalculate specific period
      const result = await calculateMerchantAnalytics(merchantId, period);

      logger.info("Merchant analytics refreshed", {
        merchantId: String(merchantId),
        period,
      });

      return result;
    }
  } catch (error) {
    logger.error("Error refreshing merchant analytics", {
      merchantId: String(merchantId),
      period,
      error: error.message,
    });
    throw handleServiceError(error, "refresh merchant analytics");
  }
};

/**
 * Get analytics for multiple merchants (admin view)
 * @param {Array} merchantIds - Array of merchant IDs
 * @param {string} period - Analytics period
 * @returns {Array} Analytics for all merchants
 */
const getBulkMerchantAnalytics = async (merchantIds, period = "week") => {
  try {
    const analytics = await MerchantAnalytics.find({
      merchantId: { $in: merchantIds },
      period,
    })
      .select("merchantId revenue.total sales.count orders.total")
      .lean();

    return analytics;
  } catch (error) {
    logger.error("Error fetching bulk merchant analytics", {
      count: merchantIds.length,
      period,
      error: error.message,
    });
    throw handleServiceError(error, "fetch bulk merchant analytics");
  }
};

/**
 * Delete merchant analytics (when merchant account deleted)
 * @param {ObjectId} merchantId - Merchant user ID
 */
const deleteMerchantAnalytics = async (merchantId) => {
  try {
    // Validate input
    validateMerchantId(merchantId);

    await MerchantAnalytics.deleteMany({ merchantId });

    logger.info("Merchant analytics deleted", {
      merchantId: String(merchantId),
    });
  } catch (error) {
    logger.error("Error deleting merchant analytics", {
      merchantId: String(merchantId),
      error: error.message,
    });
    throw handleServiceError(error, "delete merchant analytics");
  }
};

module.exports = {
  calculateMerchantAnalytics,
  getMerchantAnalytics,
  getMerchantOverview,
  refreshMerchantAnalytics,
  getBulkMerchantAnalytics,
  deleteMerchantAnalytics,
};
