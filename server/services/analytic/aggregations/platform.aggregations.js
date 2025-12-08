/**
 * Platform Analytics Aggregation Pipelines
 * MongoDB aggregations for calculating admin dashboard metrics (platform-wide stats)
 */

const { Order } = require("../../../models/order");
const Listing = require("../../../models/listing/listing.model");
const { User } = require("../../../models/user");
const logger = require("../../../utils/logger");

/**
 * Count users by role (consumer/merchant/admin)
 * SQL equivalent: SELECT
 *                   COUNT(*) as total,
 *                   SUM(CASE WHEN roles LIKE '%consumer%' THEN 1 ELSE 0 END) as consumers,
 *                   SUM(CASE WHEN roles LIKE '%merchant%' THEN 1 ELSE 0 END) as merchants,
 *                   SUM(CASE WHEN roles LIKE '%admin%' THEN 1 ELSE 0 END) as admins
 *                 FROM users
 */
const countUsersByRole = async () => {
  try {
    const total = await User.countDocuments();
    const consumers = await User.countDocuments({ roles: "consumer" });
    const merchants = await User.countDocuments({ roles: "merchant" });
    const admins = await User.countDocuments({ roles: "admin" });

    return { total, consumers, merchants, admins };
  } catch (error) {
    logger.error("Error counting users by role", { error: error.message });
    return { total: 0, consumers: 0, merchants: 0, admins: 0 };
  }
};

/**
 * Count users active in period (based on lastActive field)
 * SQL equivalent: SELECT COUNT(*) FROM users
 *                 WHERE lastActive BETWEEN ? AND ?
 */
const countActiveUsers = async (startDate, endDate) => {
  try {
    const count = await User.countDocuments({
      lastActive: { $gte: startDate, $lte: endDate },
    });
    return count;
  } catch (error) {
    logger.error("Error counting active users", { error: error.message });
    return 0;
  }
};

/**
 * Count listings by category (for category distribution chart)
 * SQL equivalent: SELECT category, COUNT(*) as count
 *                 FROM listings WHERE isAvailable = true
 *                 GROUP BY category ORDER BY count DESC
 */
const countListingsByCategory = async () => {
  try {
    const result = await Listing.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);

    return result;
  } catch (error) {
    logger.error("Error counting listings by category", {
      error: error.message,
    });
    return [];
  }
};

/**
 * Count users by campus (for campus distribution)
 * SQL equivalent: SELECT campus, COUNT(*) as count
 *                 FROM users WHERE campus IS NOT NULL
 *                 GROUP BY campus ORDER BY count DESC
 */
const countUsersByCampus = async () => {
  try {
    const result = await User.aggregate([
      { $match: { "profile.campus": { $ne: null, $exists: true } } }, // Filter out null/missing campus
      { $group: { _id: "$profile.campus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, campus: "$_id", count: 1 } },
    ]);
    return result;
  } catch (error) {
    logger.error("Error counting users by campus", { error: error.message });
    return [];
  }
};

/**
 * Calculate platform GMV (Gross Merchandise Value)
 * Total revenue from all completed orders - visible to super admin only
 * SQL equivalent: SELECT SUM(totalAmount) as total, COUNT(*) as count
 *                 FROM orders
 *                 WHERE status = 'completed' AND completedAt BETWEEN ? AND ?
 */
const calculatePlatformGMV = async (startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { total: 0, count: 0 };
  } catch (error) {
    logger.error("Error calculating platform GMV", { error: error.message });
    return { total: 0, count: 0 };
  }
};

/**
 * Count merchants by status and verification
 * Used for admin monitoring and pending verification alerts
 * SQL equivalent: SELECT
 *                   COUNT(*) as total,
 *                   SUM(CASE WHEN shopStatus = 'active' THEN 1 ELSE 0 END) as active,
 *                   SUM(CASE WHEN verificationStatus = 'verified' THEN 1 ELSE 0 END) as verified,
 *                   SUM(CASE WHEN verificationStatus = 'pending' THEN 1 ELSE 0 END) as pendingVerification,
 *                   SUM(CASE WHEN shopStatus = 'suspended' THEN 1 ELSE 0 END) as suspended
 *                 FROM users WHERE roles LIKE '%merchant%'
 */
const countMerchantsByStatus = async () => {
  try {
    const result = await User.aggregate([
      { $match: { roles: "merchant" } },
      {
        $group: {
          _id: {
            status: "$merchantDetails.shopStatus",
            verification: "$merchantDetails.verificationStatus",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      total: 0,
      active: 0,
      verified: 0,
      pendingVerification: 0,
      suspended: 0,
    };

    result.forEach((item) => {
      counts.total += item.count;
      if (item._id.status === "active") counts.active += item.count;
      if (item._id.verification === "verified") counts.verified += item.count;
      if (item._id.verification === "unverified")
        counts.pendingVerification += item.count;
      if (item._id.status === "suspended") counts.suspended += item.count;
    });

    return counts;
  } catch (error) {
    logger.error("Error counting merchants by status", {
      error: error.message,
    });
    return {
      total: 0,
      active: 0,
      verified: 0,
      pendingVerification: 0,
      suspended: 0,
    };
  }
};

module.exports = {
  countUsersByRole,
  countActiveUsers,
  countListingsByCategory,
  countUsersByCampus,
  calculatePlatformGMV,
  countMerchantsByStatus,
};
