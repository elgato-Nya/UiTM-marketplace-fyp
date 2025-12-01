const mongoose = require("mongoose");
const {
  MerchantValidator,
  merchantErrorMessages,
} = require("../../validators/user");

const {
  isValidShopName,
  isValidShopSlug,
  isValidShopDescription,
  isValidImageUrl,
} = MerchantValidator;
const errorMessages = merchantErrorMessages();

/**
 * Merchant Schema
 *
 * PURPOSE: Define merchant/shop-specific data structure for users with merchant role
 * USAGE: Embedded in User model for users with 'merchant' role
 * VALIDATION: Shop name uniqueness, slug formatting, description length limits
 * FEATURES:
 * - Unique shop names and slugs across platform
 * - Shop branding (logo, banner, description)
 * - Automatic slug generation from shop name
 * - Conditional validation based on user role
 */

const merchantSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      unique: [true, "Shop name already exists"],
      sparse: true, // Allow multiple null values for non-merchants
      trim: true,
      required: function () {
        return this.parent().roles.includes("merchant");
      },
      validate: {
        validator: isValidShopName,
        message: errorMessages.shopName.invalid,
      },
    },
    shopSlug: {
      type: String,
      unique: true,
      sparse: true, // if not set to true, null values are considered duplicate
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidShopSlug,
        message: errorMessages.shopSlug.invalid,
      },
    },
    shopDescription: {
      type: String,
      trim: true,
      validate: {
        validator: isValidShopDescription,
        message: errorMessages.shopDescription.invalid,
      },
    },
    shopLogo: {
      type: String,
      trim: true,
      validate: {
        validator: isValidImageUrl,
        message: errorMessages.shopLogo.invalid,
      },
    },
    shopBanner: {
      type: String,
      trim: true,
      validate: {
        validator: isValidImageUrl,
        message: errorMessages.shopBanner.invalid,
      },
    },
    // Additional merchant-specific fields for future expansion
    businessRegistrationNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    taxId: {
      type: String,
      trim: true,
      sparse: true,
    },
    shopStatus: {
      type: String,
      enum: {
        values: ["active", "suspended", "pending_verification", "closed"],
        message: "Invalid shop status",
      },
      default: "pending_verification",
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ["unverified", "pending", "verified", "rejected"],
        message: "Invalid verification status",
      },
      default: "unverified",
    },
    shopRating: {
      averageRating: {
        type: Number,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
        default: 0,
      },
      totalReviews: {
        type: Number,
        min: [0, "Review count cannot be negative"],
        default: 0,
      },
    },
    shopMetrics: {
      totalProducts: {
        type: Number,
        min: [0, "Product count cannot be negative"],
        default: 0,
      },
      totalSales: {
        type: Number,
        min: [0, "Sales count cannot be negative"],
        default: 0,
      },
      totalRevenue: {
        type: Number,
        min: [0, "Revenue cannot be negative"],
        default: 0,
      },
      totalViews: {
        type: Number,
        min: [0, "Views count cannot be negative"],
        default: 0,
      },
    },
  },
  {
    _id: false, // Don't create separate _id for embedded document
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: {
      virtuals: true, // Include virtuals in JSON output
      versionKey: false, // Exclude version key from JSON output
    },
  }
);

// ================== INDEXES ==================

merchantSchema.index({ shopSlug: 1, shopStatus: 1 });
merchantSchema.index({ shopStatus: 1, verificationStatus: 1 });
merchantSchema.index({
  "shopRating.averageRating": -1,
  "shopMetrics.totalSales": -1,
});

// ================== MIDDLEWARE ==================

/**
 * Pre-save middleware: Generate shop slug from shop name
 */
merchantSchema.pre("save", function (next) {
  // Only generate slug if shopName exists and slug doesn't exist
  if (this.shopName && !this.shopSlug) {
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    this.shopSlug = this.shopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }
  next();
});

// ================== VIRTUAL FIELDS ==================

/**
 * Virtual: Shop URL
 * PURPOSE: Generate SEO-friendly shop URL
 */
merchantSchema.virtual("shopUrl").get(function () {
  return this.shopSlug ? `/shop/${this.shopSlug}` : null;
});

/**
 * Virtual: Is shop verified
 * PURPOSE: Quick check for shop verification status
 */
merchantSchema.virtual("isVerified").get(function () {
  return this.verificationStatus === "verified";
});

/**
 * Virtual: Is shop active
 * PURPOSE: Quick check if shop is operational
 */
merchantSchema.virtual("isShopActive").get(function () {
  return this.shopStatus === "active" && this.isVerified;
});

// ================== METHODS ==================

/**
 * Update shop metrics
 * PURPOSE: Update shop statistics (products, sales, revenue)
 */
merchantSchema.methods.updateMetrics = function (metrics) {
  if (metrics.totalProducts !== undefined) {
    this.shopMetrics.totalProducts = Math.max(0, metrics.totalProducts);
  }
  if (metrics.totalSales !== undefined) {
    this.shopMetrics.totalSales = Math.max(0, metrics.totalSales);
  }
  if (metrics.totalRevenue !== undefined) {
    this.shopMetrics.totalRevenue = Math.max(0, metrics.totalRevenue);
  }
};

/**
 * Update shop rating
 * PURPOSE: Update average rating and review count
 */
merchantSchema.methods.updateRating = function (newRating, isNewReview = true) {
  const currentTotal = this.shopRating.totalReviews;
  const currentAverage = this.shopRating.averageRating;

  if (isNewReview) {
    // Add new review
    const newTotal = currentTotal + 1;
    const newAverage = (currentAverage * currentTotal + newRating) / newTotal;

    this.shopRating.totalReviews = newTotal;
    this.shopRating.averageRating = Math.round(newAverage * 10) / 10; // Round to 1 decimal
  }
};

module.exports = merchantSchema;
