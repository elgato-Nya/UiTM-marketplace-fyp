/**
 * Merchant Analytics Aggregation Pipelines
 * MongoDB aggregations for calculating merchant dashboard metrics
 */

const { Order } = require("../../../models/order");
const Listing = require("../../../models/listing/listing.model");
const logger = require("../../../utils/logger");
const mongoose = require("mongoose");
const { fillMissingDates } = require("./helpers");

/**
 * Safely convert to MongoDB ObjectId
 * @param {String|ObjectId} id - ID to convert
 * @returns {ObjectId} MongoDB ObjectId
 */
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

/**
 * Calculate total revenue for a merchant
 * SQL equivalent: SELECT SUM(totalAmount) as total, COUNT(*) as count
 *                 FROM orders
 *                 WHERE sellerUserId = ? AND status = 'completed'
 *                 AND completedAt BETWEEN ? AND ?
 */
const calculateMerchantRevenue = async (merchantId, startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
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
    logger.error("Error calculating merchant revenue", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return { total: 0, count: 0 };
  }
};

/**
 * Calculate revenue breakdown by product category
 * SQL equivalent: SELECT category, SUM(totalPrice) as amount, SUM(quantity) as count
 *                 FROM order_items oi
 *                 JOIN orders o ON o.id = oi.orderId
 *                 WHERE o.sellerUserId = ? AND o.status = 'completed'
 *                 GROUP BY category ORDER BY amount DESC
 */
const calculateRevenueByCategory = async (merchantId, startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" }, // Split order items into separate documents
      {
        $group: {
          _id: "$items.category",
          amount: { $sum: "$items.totalPrice" },
          count: { $sum: "$items.quantity" },
        },
      },
      { $sort: { amount: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          amount: 1,
          count: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    logger.error("Error calculating revenue by category", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return [];
  }
};

/**
 * Find best and worst revenue days in period
 * SQL equivalent: SELECT DATE(completedAt) as date, SUM(totalAmount) as amount
 *                 FROM orders WHERE sellerUserId = ? AND status = 'completed'
 *                 GROUP BY DATE(completedAt) ORDER BY amount DESC/ASC LIMIT 1
 */
const findBestWorstDays = async (merchantId, startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          amount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    if (result.length === 0) {
      return {
        highestDay: { date: null, amount: 0 },
        lowestDay: { date: null, amount: 0 },
      };
    }

    return {
      highestDay: {
        date: new Date(result[0]._id),
        amount: result[0].amount,
      },
      lowestDay: {
        date: new Date(result[result.length - 1]._id),
        amount: result[result.length - 1].amount,
      },
    };
  } catch (error) {
    logger.error("Error finding best/worst days", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return {
      highestDay: { date: null, amount: 0 },
      lowestDay: { date: null, amount: 0 },
    };
  }
};

/**
 * Calculate daily sales trend for charts
 * Returns complete timeline with missing dates filled with zeros
 */
const calculateSalesTrend = async (merchantId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: { $toDate: "$_id" },
          count: 1,
          revenue: 1,
        },
      },
    ]);

    // Fill missing days with zeros for continuous chart display
    return fillMissingDates(result, startDate, endDate);
  } catch (error) {
    logger.error("Error calculating sales trend", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return [];
  }
};

/**
 * Count orders by status with percentages
 * SQL equivalent: SELECT status, COUNT(*) as count
 *                 FROM orders WHERE sellerUserId = ?
 *                 GROUP BY status
 */
const countOrdersByStatus = async (merchantId, startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    result.forEach((item) => {
      statusCounts[item._id] = item.count;
      statusCounts.total += item.count;
    });

    // Calculate percentages for pie chart
    const statusDistribution = {};
    ["pending", "confirmed", "completed", "cancelled"].forEach((status) => {
      statusDistribution[`${status}Percent`] =
        statusCounts.total > 0
          ? Number(
              ((statusCounts[status] / statusCounts.total) * 100).toFixed(1)
            )
          : 0;
    });

    return { ...statusCounts, statusDistribution };
  } catch (error) {
    logger.error("Error counting orders by status", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      statusDistribution: {},
    };
  }
};

/**
 * Calculate average order value (AOV)
 * SQL equivalent: SELECT AVG(totalAmount) FROM orders
 *                 WHERE sellerUserId = ? AND status = 'completed'
 */
const calculateAverageOrderValue = async (merchantId, startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avgValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    return Number((result[0]?.avgValue || 0).toFixed(2));
  } catch (error) {
    logger.error("Error calculating average order value", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return 0;
  }
};

/**
 * Get top selling products by quantity sold
 * SQL equivalent: SELECT listingId, name, SUM(quantity) as sales, SUM(totalPrice) as revenue
 *                 FROM order_items oi JOIN orders o ON o.id = oi.orderId
 *                 WHERE o.sellerUserId = ? AND o.status = 'completed'
 *                 GROUP BY listingId ORDER BY sales DESC LIMIT ?
 */
const getTopSellingProducts = async (merchantId, limit = 10) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          "seller.userId": toObjectId(merchantId),
          status: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.listingId",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
          category: { $first: "$items.category" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          listingId: "$_id",
          name: 1,
          sales: 1,
          revenue: 1,
          category: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    logger.error("Error getting top selling products", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return [];
  }
};

/**
 * Count active vs inactive listings
 * SQL equivalent: SELECT isAvailable, COUNT(*) FROM listings
 *                 WHERE sellerUserId = ? GROUP BY isAvailable
 */
const countMerchantListings = async (merchantId) => {
  try {
    const result = await Listing.aggregate([
      {
        $match: { "seller.userId": toObjectId(merchantId) },
      },
      {
        $group: {
          _id: "$isAvailable",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      totalActive: 0,
      totalInactive: 0,
    };

    result.forEach((item) => {
      if (item._id === true) {
        counts.totalActive = item.count;
      } else {
        counts.totalInactive = item.count;
      }
    });

    return counts;
  } catch (error) {
    logger.error("Error counting merchant listings", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return { totalActive: 0, totalInactive: 0 };
  }
};

/**
 * Count products with low stock (< 5 units)
 * SQL equivalent: SELECT COUNT(*) FROM listings
 *                 WHERE sellerUserId = ? AND type = 'product'
 *                 AND stock < 5 AND stock > 0 AND isAvailable = true
 */
const countLowStockProducts = async (merchantId) => {
  try {
    const count = await Listing.countDocuments({
      "seller.userId": toObjectId(merchantId),
      type: "product",
      stock: { $lt: 5, $gt: 0 },
      isAvailable: true,
    });

    return count;
  } catch (error) {
    logger.error("Error counting low stock products", {
      merchantId: merchantId?.toString?.() || merchantId,
      error: error.message,
    });
    return 0;
  }
};

module.exports = {
  calculateMerchantRevenue,
  calculateRevenueByCategory,
  findBestWorstDays,
  calculateSalesTrend,
  countOrdersByStatus,
  calculateAverageOrderValue,
  getTopSellingProducts,
  countMerchantListings,
  countLowStockProducts,
};
