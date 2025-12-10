/**
 * Platform Analytics Service
 * Business logic for calculating and managing admin dashboard analytics (platform-wide)
 */

const { PlatformAnalytics } = require("../../models/analytic");
const { User } = require("../../models/user");
const {
  getDateRange,
  calculateGrowthRate,
  countUsersByRole,
  countActiveUsers,
  countListingsByCategory,
  countUsersByCampus,
  calculatePlatformGMV,
  countMerchantsByStatus,
} = require("./aggregations");
const { handleServiceError, getEnumValueByKey } = require("../base.service");
const { CampusEnum } = require("../../utils/enums/user.enum");
const logger = require("../../utils/logger");

/**
 * Calculate and save platform-wide analytics
 * Called by scheduled job every 15 minutes
 * @param {string} period - 'week', 'month', 'year'
 */
const calculatePlatformAnalytics = async (period = "week") => {
  try {
    const { start, end, previous } = getDateRange(period);

    // Calculate current period metrics
    const [
      userCounts,
      activeUsers,
      listingsByCategory,
      totalListings,
      usersByCampus,
      gmv,
      merchantStats,
    ] = await Promise.all([
      countUsersByRole(),
      countActiveUsers(start, end),
      countListingsByCategory(),
      require("../../models/listing/listing.model").countDocuments({}), // Total listings (all)
      countUsersByCampus(),
      calculatePlatformGMV(start, end),
      countMerchantsByStatus(),
    ]);

    // Calculate previous period for growth rates
    const [previousActiveUsers, previousGMV, previousUserCount] =
      await Promise.all([
        countActiveUsers(previous, start),
        calculatePlatformGMV(previous, start),
        countUsersByRole(), // Get current count for comparison
      ]);

    // Calculate user growth properly
    // We need to estimate previous total by subtracting new users in current period
    const newUsersInPeriod = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });
    const previousTotalUsers = userCounts.total - newUsersInPeriod;

    const userGrowthRate = calculateGrowthRate(
      userCounts.total,
      previousTotalUsers
    );

    const gmvGrowthRate = calculateGrowthRate(gmv.total, previousGMV.total);

    // Build analytics document
    const analyticsData = {
      period,
      startDate: start,
      endDate: end,

      // User metrics
      users: {
        total: userCounts.total,
        consumers: userCounts.consumers,
        merchants: userCounts.merchants,
        admins: userCounts.admins,
        activeToday: activeUsers,
        byCampus: usersByCampus,
        growthRate: userGrowthRate,
      },

      // Listing metrics
      listings: {
        total: totalListings, // All listings (including inactive)
        active: listingsByCategory.reduce((sum, cat) => sum + cat.count, 0), // Only available listings
        byCategory: listingsByCategory,
      },

      // Order metrics (GMV - visible to super admin only)
      orders: {
        totalCompleted: gmv.count,
        gmv: gmv.total,
        gmvGrowthRate,
      },

      // Merchant metrics
      merchants: {
        total: merchantStats.total,
        active: merchantStats.active,
        verified: merchantStats.verified,
        pendingVerification: merchantStats.pendingVerification,
        suspended: merchantStats.suspended,
      },

      // Platform activity
      activity: {
        dailyActiveUsers: activeUsers,
        newListingsToday: 0, // TODO: Implement if needed
        ordersToday: gmv.count, // Approximation for period
      },

      lastCalculated: new Date(),
    };

    // Upsert analytics (update if exists, insert if new)
    const result = await PlatformAnalytics.findOneAndUpdate(
      { period },
      analyticsData,
      { upsert: true, new: true, runValidators: true }
    );

    // Don't log individual success, only errors
    return result;
  } catch (error) {
    logger.error("Error calculating platform analytics", {
      period,
      error: error.message,
      stack: error.stack,
    });
    throw handleServiceError(error, "calculate platform analytics");
  }
};

/**
 * Get platform analytics by period
 * @param {string} period - 'week', 'month', 'year'
 * @param {string} adminLevel - 'super' or 'moderator' (affects data visibility)
 * @returns {Object} Analytics data (GMV hidden for moderators)
 */
const getPlatformAnalytics = async (period = "week", adminLevel = "super") => {
  try {
    const analytics = await PlatformAnalytics.findOne({ period }).lean();

    if (!analytics) {
      logger.info("No platform analytics found, returning empty data", {
        period,
      });

      return {
        period,
        users: {
          total: 0,
          consumers: 0,
          merchants: 0,
          admins: 0,
          activeToday: 0,
          byCampus: [],
          growthRate: 0,
        },
        listings: { total: 0, active: 0, byCategory: [] },
        orders: { totalCompleted: 0, gmv: 0, gmvGrowthRate: 0 },
        merchants: {
          total: 0,
          active: 0,
          verified: 0,
          pendingVerification: 0,
          suspended: 0,
        },
        activity: { dailyActiveUsers: 0, newListingsToday: 0, ordersToday: 0 },
        lastCalculated: null,
      };
    }

    // Convert campus keys to display values
    const byCampusWithValues = analytics.users.byCampus.map((campusData) => ({
      campus: getEnumValueByKey(CampusEnum, campusData.campus),
      count: campusData.count,
    }));

    // Hide financial data from moderator admins
    if (adminLevel === "moderator") {
      return {
        ...analytics,
        users: {
          ...analytics.users,
          byCampus: byCampusWithValues,
        },
        orders: {
          totalCompleted: analytics.orders.totalCompleted,
          gmv: null, // Hidden
          gmvGrowthRate: null, // Hidden
        },
      };
    }

    return {
      ...analytics,
      users: {
        ...analytics.users,
        byCampus: byCampusWithValues,
      },
    };
  } catch (error) {
    logger.error("Error fetching platform analytics", {
      period,
      error: error.message,
    });
    throw handleServiceError(error, "fetch platform analytics");
  }
};

/**
 * Get platform overview (summary of all periods)
 * @param {string} adminLevel - Admin access level
 * @returns {Object} Overview with week, month, year data
 */
const getPlatformOverview = async (adminLevel = "super") => {
  try {
    const [weekData, monthData, yearData] = await Promise.all([
      getPlatformAnalytics("week", adminLevel),
      getPlatformAnalytics("month", adminLevel),
      getPlatformAnalytics("year", adminLevel),
    ]);

    return {
      week: weekData,
      month: monthData,
      year: yearData,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error("Error fetching platform overview", {
      error: error.message,
    });
    throw handleServiceError(error, "fetch platform overview");
  }
};

/**
 * Refresh platform analytics manually (admin only)
 * @param {string} period - 'week', 'month', 'year', or 'all'
 * @returns {Object} Updated analytics
 */
const refreshPlatformAnalytics = async (period = "all") => {
  try {
    if (period === "all") {
      const [week, month, year] = await Promise.all([
        calculatePlatformAnalytics("week"),
        calculatePlatformAnalytics("month"),
        calculatePlatformAnalytics("year"),
      ]);

      logger.info("All platform analytics refreshed");

      return { week, month, year };
    } else {
      const result = await calculatePlatformAnalytics(period);

      logger.info("Platform analytics refreshed", { period });

      return result;
    }
  } catch (error) {
    logger.error("Error refreshing platform analytics", {
      period,
      error: error.message,
    });
    throw handleServiceError(error, "refresh platform analytics");
  }
};

/**
 * Get pending merchant verifications (for admin alerts)
 * @returns {number} Count of pending verifications
 */
const getPendingVerifications = async () => {
  try {
    const analytics = await PlatformAnalytics.findOne({ period: "week" })
      .select("merchants.pendingVerification")
      .lean();

    return analytics?.merchants?.pendingVerification || 0;
  } catch (error) {
    logger.error("Error fetching pending verifications", {
      error: error.message,
    });
    return 0;
  }
};

module.exports = {
  calculatePlatformAnalytics,
  getPlatformAnalytics,
  getPlatformOverview,
  refreshPlatformAnalytics,
  getPendingVerifications,
};
