const mongoose = require("mongoose");
const { ListingCategory } = require("../../utils/enums/listing.enum");

/**
 * Merchant Analytics Model
 *
 * PURPOSE: Store pre-calculated analytics for merchants to make dashboard FAST
 * WHY SEPARATE FROM merchantDetails?: Historical data, trends, detailed breakdowns
 *
 * AGGREGATION HAPPENS IN: services/analytics/merchant.analytics.service.js
 * UPDATED BY: Scheduled job (every 15 mins) + on-demand refresh
 *
 * EXPLANATION OF FIELDS:
 * - count: How many items/orders in that category (e.g., 5 electronics sold)
 * - amount: Total revenue from that category (e.g., RM 500 from electronics)
 * - _id: false: Don't create MongoDB _id for subdocuments (saves space, cleaner data)
 */

const merchantAnalyticsSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Period this data represents
    period: {
      type: String,
      enum: {
        values: ["week", "month", "year"],
        message: "Period must be week, month, or year",
      },
      required: [true, "Period is required"],
    },

    // Date range for this analytics snapshot
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // ==================== REVENUE METRICS ====================
    revenue: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Revenue cannot be negative"],
      },
      today: { type: Number, default: 0, min: 0 },
      week: { type: Number, default: 0, min: 0 },
      month: { type: Number, default: 0, min: 0 },
      year: { type: Number, default: 0, min: 0 },
      allTime: { type: Number, default: 0, min: 0 },

      // Revenue breakdown by category
      // EXAMPLE: [{ category: "electronics", amount: 500, count: 5 }]
      // Means: RM 500 from 5 electronics sales
      byCategory: [
        {
          category: {
            type: String,
            enum: {
              values: Object.values(ListingCategory),
              message: "Invalid category",
            },
          },
          amount: {
            type: Number,
            default: 0,
            min: [0, "Category revenue cannot be negative"],
          },
          count: {
            type: Number,
            default: 0,
            min: [0, "Category count cannot be negative"],
          },
          _id: false, // Don't create _id for each category (cleaner, smaller data)
        },
      ],

      // Best and worst performing days (for insights)
      // EXAMPLE: highestDay = { date: "2025-11-05", amount: 1500 }
      highestDay: {
        date: Date,
        amount: { type: Number, default: 0, min: 0 },
      },
      lowestDay: {
        date: Date,
        amount: { type: Number, default: 0, min: 0 },
      },

      // For growth comparison (e.g., "This month vs last month")
      previousPeriod: {
        type: Number,
        default: 0,
        min: [0, "Previous period revenue cannot be negative"],
      },
      growthRate: {
        type: Number,
        default: 0,
        // Can be negative (decline) or positive (growth)
        validate: {
          validator: function (value) {
            return value >= -100 && value <= 1000; // Max 1000% growth, -100% max decline
          },
          message: "Growth rate must be between -100% and 1000%",
        },
      },
    },

    // ==================== SALES METRICS ====================
    // DIFFERENCE from revenue: Sales = number of transactions, Revenue = money
    // EXAMPLE: 10 sales of RM 50 each = 10 sales, RM 500 revenue
    sales: {
      count: {
        type: Number,
        default: 0,
        min: [0, "Sales count cannot be negative"],
      },
      previousPeriodCount: { type: Number, default: 0, min: 0 },
      growthRate: { type: Number, default: 0 },

      // Trend data for charts (last 30 days)
      // EXAMPLE: [{ date: "2025-11-01", count: 5, revenue: 250 }, ...]
      // This powers the line chart showing sales over time
      trend: [
        {
          date: {
            type: Date,
            required: [true, "Trend date is required"],
          },
          count: { type: Number, default: 0, min: 0 },
          revenue: { type: Number, default: 0, min: 0 },
          _id: false, // Don't need _id for trend points
        },
      ],
    },

    // ==================== ORDER METRICS ====================
    // Status breakdown helps merchant see what needs action
    orders: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Total orders cannot be negative"],
      },
      pending: { type: Number, default: 0, min: 0 },
      confirmed: { type: Number, default: 0, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
      cancelled: { type: Number, default: 0, min: 0 },
      averageValue: {
        type: Number,
        default: 0,
        min: [0, "Average order value cannot be negative"],
      },

      // Percentage distribution (for pie charts)
      // EXAMPLE: pendingPercent: 20 means "20% of orders are pending"
      statusDistribution: {
        pendingPercent: {
          type: Number,
          default: 0,
          min: [0, "Percentage cannot be negative"],
          max: [100, "Percentage cannot exceed 100"],
        },
        confirmedPercent: { type: Number, default: 0, min: 0, max: 100 },
        completedPercent: { type: Number, default: 0, min: 0, max: 100 },
        cancelledPercent: { type: Number, default: 0, min: 0, max: 100 },
      },
    },

    // ==================== LISTING/PRODUCT METRICS ====================
    // Helps merchant manage inventory and see what's selling
    listings: {
      totalActive: {
        type: Number,
        default: 0,
        min: [0, "Active listings cannot be negative"],
      },
      totalInactive: { type: Number, default: 0, min: 0 },
      lowStock: {
        type: Number,
        default: 0,
        min: 0,
        // Products with stock < 5 (need restock alert)
      },

      // Top 10 best-selling listings
      // AGGREGATION CALCULATES THIS: Sum all order items, group by listing, sort by sales
      topSelling: [
        {
          listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: [true, "Listing ID is required for top selling"],
          },
          name: {
            type: String,
            required: [true, "Listing name is required"],
          },
          sales: {
            type: Number,
            default: 0,
            min: [0, "Sales count cannot be negative"],
          },
          revenue: {
            type: Number,
            default: 0,
            min: [0, "Revenue cannot be negative"],
          },
          category: {
            type: String,
            enum: Object.values(ListingCategory),
          },
          _id: false, // No need for _id in array items
        },
      ],
    },

    // ==================== CONVERSION METRICS ====================
    // Measures how well listings convert views into sales
    conversion: {
      views: {
        type: Number,
        default: 0,
        min: [0, "Views cannot be negative"],
      },
      purchases: {
        type: Number,
        default: 0,
        min: [0, "Purchases cannot be negative"],
      },
      rate: {
        type: Number,
        default: 0,
        min: [0, "Conversion rate cannot be negative"],
        max: [100, "Conversion rate cannot exceed 100%"],
        // CALCULATION: (purchases / views) * 100
        // EXAMPLE: 50 views, 5 purchases = 10% conversion rate
      },
    },

    // When this analytics snapshot was calculated
    lastCalculated: {
      type: Date,
      default: Date.now,
      required: [true, "Last calculated date is required"],
    },
  },
  {
    timestamps: true, // Auto-add createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES FOR PERFORMANCE ====================
// Compound index: Fast queries like "Get merchant's week/month/year analytics"
merchantAnalyticsSchema.index({ merchantId: 1, period: 1 }, { unique: true });
// Single index: For cleanup jobs to find old data
merchantAnalyticsSchema.index({ lastCalculated: 1 });
merchantAnalyticsSchema.index({ endDate: -1 });

// ==================== STATIC METHODS ====================
// These are like "class methods" - called on the model itself, not instances

/**
 * Get analytics document for a merchant and period
 * USAGE: const analytics = await MerchantAnalytics.findByMerchantAndPeriod(merchantId, 'week')
 */
merchantAnalyticsSchema.statics.findByMerchantAndPeriod = async function (
  merchantId,
  period = "week"
) {
  return await this.findOne({
    merchantId,
    period,
  }).exec();
};

const MerchantAnalytics = mongoose.model(
  "MerchantAnalytics",
  merchantAnalyticsSchema
);

module.exports = MerchantAnalytics;
