// TODO: check for the default value and the validators with custom error messages
const mongoose = require("mongoose");
const { CampusEnum } = require("../../utils/enums/user.enum");
const { ListingCategory } = require("../../utils/enums/listing.enum");

/**
 * Platform Analytics Model
 *
 * PURPOSE: Store platform-wide statistics for ADMIN dashboard
 * WHY SEPARATE?: Aggregating across ALL users is expensive, pre-calculate it
 * UPDATED: Daily at midnight + on-demand for super admins
 *
 * PRIVACY NOTE: Only super admins see financial data (revenue/GMV)
 * Moderator admins see user/merchant counts but NOT money
 */

const platformAnalyticsSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      enum: {
        values: ["week", "month", "year"],
        message: "Period must be week, month, or year",
      },
      required: [true, "Period is required"],
    },

    // Date range for this analytics period
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // ==================== USER METRICS ====================
    users: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Total users cannot be negative"],
      },
      consumers: { type: Number, default: 0, min: 0 },
      merchants: { type: Number, default: 0, min: 0 },
      admins: { type: Number, default: 0, min: 0 },

      // Activity metrics (who's using the platform?)
      activeToday: {
        type: Number,
        default: 0,
        min: 0,
        // CALCULATION: Users with lastActive = today
      },
      activeWeek: { type: Number, default: 0, min: 0 },
      newToday: {
        type: Number,
        default: 0,
        min: 0,
        // CALCULATION: Count users with createdAt = today
      },
      newWeek: { type: Number, default: 0, min: 0 },

      // Growth rate vs previous period (percentage)
      growthRate: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            return value >= -100 && value <= 1000;
          },
          message: "Growth rate must be between -100% and 1000%",
        },
      },

      // Users by campus (university-specific insight)
      // EXAMPLE: [{ campus: "UiTM Shah Alam", count: 500 }]
      byCampus: [
        {
          campus: {
            type: String,
            enum: {
              values: Object.keys(CampusEnum), // Use keys to match User model
              message: "Invalid campus value",
            },
          },
          count: {
            type: Number,
            default: 0,
            min: [0, "Campus user count cannot be negative"],
          },
          _id: false,
        },
      ],
    },

    // ==================== LISTING METRICS ====================
    listings: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Total listings cannot be negative"],
      },
      products: { type: Number, default: 0, min: 0 },
      services: { type: Number, default: 0, min: 0 },
      active: {
        type: Number,
        default: 0,
        min: 0,
        // Listings with isAvailable = true
      },
      inactive: { type: Number, default: 0, min: 0 },

      // Breakdown by category (what's popular?)
      byCategory: [
        {
          category: {
            type: String,
            enum: {
              values: Object.values(ListingCategory),
              message: "Invalid category",
            },
          },
          count: {
            type: Number,
            default: 0,
            min: [0, "Category count cannot be negative"],
          },
          _id: false,
        },
      ],

      newToday: {
        type: Number,
        default: 0,
        min: 0,
        // New listings created today
      },
    },

    // ==================== ORDER METRICS ====================
    // GMV = Gross Merchandise Value (total money flowing through platform)
    orders: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Total orders cannot be negative"],
      },
      today: { type: Number, default: 0, min: 0 },
      week: { type: Number, default: 0, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
      pending: { type: Number, default: 0, min: 0 },
      cancelled: { type: Number, default: 0, min: 0 },

      // GMV = Total money in completed orders (super admin only!)
      // IMPORTANT: This is REVENUE for merchants, not platform profit
      gmv: {
        total: {
          type: Number,
          default: 0,
          min: [0, "GMV cannot be negative"],
        },
        today: { type: Number, default: 0, min: 0 },
        week: { type: Number, default: 0, min: 0 },
        month: { type: Number, default: 0, min: 0 },
      },

      averageOrderValue: {
        type: Number,
        default: 0,
        min: [0, "Average order value cannot be negative"],
        // CALCULATION: total GMV / total orders
      },
    },

    // ==================== MERCHANT METRICS ====================
    merchants: {
      total: {
        type: Number,
        default: 0,
        min: [0, "Total merchants cannot be negative"],
      },
      active: {
        type: Number,
        default: 0,
        min: 0,
        // shopStatus = "active"
      },
      verified: {
        type: Number,
        default: 0,
        min: 0,
        // verificationStatus = "verified"
      },
      pendingVerification: {
        type: Number,
        default: 0,
        min: 0,
        // Needs admin action!
      },
      suspended: { type: Number, default: 0, min: 0 },
      newToday: { type: Number, default: 0, min: 0 },
    },

    // ==================== ACTIVITY METRICS ====================
    activity: {
      loginsToday: {
        type: Number,
        default: 0,
        min: [0, "Login count cannot be negative"],
      },
      ordersToday: { type: Number, default: 0, min: 0 },
      listingsCreatedToday: { type: Number, default: 0, min: 0 },

      // Peak activity tracking (which day was busiest?)
      peakDay: {
        date: Date,
        logins: { type: Number, default: 0, min: 0 },
        orders: { type: Number, default: 0, min: 0 },
      },
    },

    lastCalculated: {
      type: Date,
      default: Date.now,
      required: [true, "Last calculated date is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
platformAnalyticsSchema.index({ period: 1 }, { unique: true });
platformAnalyticsSchema.index({ lastCalculated: 1 }); // Cleanup jobs
platformAnalyticsSchema.index({ endDate: -1 }); // Date range queries

// ==================== STATIC METHODS ====================

/**
 * Get platform analytics by period
 */
platformAnalyticsSchema.statics.findByPeriod = async function (
  period = "week"
) {
  return await this.findOne({ period }).exec();
};

const PlatformAnalytics = mongoose.model(
  "PlatformAnalytics",
  platformAnalyticsSchema
);

module.exports = PlatformAnalytics;
