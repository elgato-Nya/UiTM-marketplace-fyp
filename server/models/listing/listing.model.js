const mongoose = require("mongoose");

const {
  ListingCategory,
  VariantLimits,
} = require("../../utils/enums/listing.enum");
const {
  ListingValidator,
  listingErrorMessages,
  userErrorMessages,
} = require("../../validators");
const VariantSchema = require("./variant.schema");
const { QuoteSettingsSchema } = require("./quoteSettings.schema");

const {
  isValidListingName,
  isValidListingDescription,
  isValidImagesArray,
  isValidVariantsArray,
  isValidQuoteSettings,
} = ListingValidator;

/**
 * Listing Model
 *
 * PURPOSE: Basic listing schema for e-commerce with variant support
 * FEATURES: Name, description, price, category, images, stock, variants, quote system
 * BACKWARD COMPATIBILITY: Existing listings without variants continue to work
 */

const ListingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, listingErrorMessages.type.required],
      enum: {
        values: ["product", "service"],
        message: listingErrorMessages.type.invalid,
      },
      index: true,
    },

    name: {
      type: String,
      required: [true, listingErrorMessages.name.required],
      trim: true,
      maxlength: [100, listingErrorMessages.name.invalid.length],
      index: true,
      validate: [isValidListingName, listingErrorMessages.name.invalid.format],
    },

    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [1000, listingErrorMessages.description.invalid],
    },

    price: {
      type: Number,
      required: [
        function () {
          // Price required if NO variants AND NOT quote-based/quote-only
          const hasVariants = this.variants && this.variants.length > 0;
          const isQuoteBased = this.quoteSettings?.enabled === true;
          const isQuoteOnly = this.quoteSettings?.quoteOnly === true;
          return !hasVariants && !isQuoteBased && !isQuoteOnly;
        },
        listingErrorMessages.price.conditionalRequired,
      ],
      min: [0, listingErrorMessages.price.invalid],
      index: true,
    },

    category: {
      type: String,
      required: [true, listingErrorMessages.category.required],
      enum: {
        values: Object.values(ListingCategory),
        message: listingErrorMessages.category.invalid,
      },
      index: true,
    },

    images: {
      type: [String],
      required: [true, listingErrorMessages.images.required],
      trim: true,
      validate: [
        isValidImagesArray,
        listingErrorMessages.images.invalid.format,
      ],
    },

    stock: {
      type: Number,
      required: [
        function () {
          // Stock required for products WITHOUT variants
          const hasVariants = this.variants && this.variants.length > 0;
          return this.type === "product" && !hasVariants;
        },
        listingErrorMessages.stock.conditionalRequired,
      ],
      min: [0, "Stock cannot be negative"],
      default: function () {
        // Only set default for products without variants
        const hasVariants = this.variants && this.variants.length > 0;
        if (this.type === "product" && !hasVariants) return 0;
        return undefined;
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFree: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ======================   Variants (Optional)   ========================
    variants: {
      type: [VariantSchema],
      default: undefined, // Not required - backward compatible
      validate: [
        {
          validator: function (variants) {
            if (!variants || variants.length === 0) return true;
            return variants.length <= VariantLimits.MAX_VARIANTS_PER_LISTING;
          },
          message: listingErrorMessages.variant.array.limitReached,
        },
        {
          validator: function (variants) {
            if (!variants || variants.length === 0) return true;
            // Validate stock is set for each variant if listing is a product
            if (this.type === "product") {
              return variants.every(
                (v) => v.stock !== undefined && v.stock !== null
              );
            }
            return true;
          },
          message: listingErrorMessages.variant.stock.required,
        },
      ],
    },

    // ======================   Quote Settings (Services Only)   ========================
    quoteSettings: {
      type: QuoteSettingsSchema,
      default: undefined, // Not required - backward compatible
      validate: [
        {
          validator: function (quoteSettings) {
            // Quote settings only valid for services
            if (quoteSettings?.enabled && this.type !== "service") {
              return false;
            }
            return true;
          },
          message: listingErrorMessages.quoteSettings.serviceOnly,
        },
      ],
    },

    // ======================   Seller Information   ========================
    seller: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: [
          mongoose.Types.ObjectId.isValid,
          userErrorMessages.mongoId.invalid.user,
        ],
        index: true,
      },
      userType: {
        type: String,
        enum: ["consumer", "merchant"],
        default: "merchant", // Default to merchant since only merchants can create listings
        index: true,
      },
      // Denormalized for performance - these fields rarely change
      username: {
        type: String,
        index: true,
      },
      // For merchants only - changes very rarely (perfect for denormalization)
      shopSlug: {
        type: String,
        index: true,
        sparse: true, // Only merchants have shop slugs
      },
      shopName: {
        type: String,
        sparse: true,
      },
      isVerifiedMerchant: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ListingSchema.index({ name: "text", description: "text" });
ListingSchema.index({ category: 1, isAvailable: 1, price: 1 });
ListingSchema.index({ "seller.userId": 1, isAvailable: 1 });
ListingSchema.index({ "seller.userType": 1, isAvailable: 1 });
ListingSchema.index({ "seller.shopSlug": 1, isAvailable: 1 });
ListingSchema.index({ "seller.isVerifiedMerchant": 1, category: 1 });

// Variant-specific indexes
ListingSchema.index({ "variants._id": 1 });
ListingSchema.index(
  { "variants.sku": 1, "seller.userId": 1 },
  { sparse: true }
);
ListingSchema.index({ "variants.isAvailable": 1, isAvailable: 1 });
ListingSchema.index({ "quoteSettings.enabled": 1, type: 1 }, { sparse: true });

// ======================   Virtuals   ========================

// Virtual for checking if listing has variants
ListingSchema.virtual("hasVariants").get(function () {
  return Array.isArray(this.variants) && this.variants.length > 0;
});

// Virtual for checking if listing is quote-based
ListingSchema.virtual("isQuoteBased").get(function () {
  return this.quoteSettings?.enabled === true;
});

// Virtual for checking if listing is quote-only (no fixed price)
ListingSchema.virtual("isQuoteOnly").get(function () {
  return this.quoteSettings?.quoteOnly === true;
});

// Virtual for checking if listing is in stock (updated for variants)
ListingSchema.virtual("inStock").get(function () {
  if (this.type === "service") return true; // Services are always "in stock"

  // If has variants, check variant stock
  if (this.variants && this.variants.length > 0) {
    return this.variants.some((v) => v.isAvailable && v.stock > 0);
  }

  // Legacy mode: check listing-level stock
  return this.stock > 0;
});

// Virtual for seller display name
ListingSchema.virtual("sellerDisplayName").get(function () {
  return this.seller.shopName || this.seller.username;
});

// Virtual for seller profile URL
ListingSchema.virtual("sellerProfileUrl").get(function () {
  if (this.seller.userType === "merchant" && this.seller.shopSlug) {
    return `/shop/${this.seller.shopSlug}`;
  }
  return `/user/${this.seller.username}`;
});

// ======================   Instance Methods   ========================

/**
 * Get the minimum price (from variants or base price)
 * @returns {number|null} Minimum price or null if quote-based
 */
ListingSchema.methods.getMinPrice = function () {
  if (this.quoteSettings?.enabled) {
    return this.quoteSettings.minPrice || null;
  }

  if (this.variants && this.variants.length > 0) {
    const availableVariants = this.variants.filter((v) => v.isAvailable);
    if (availableVariants.length === 0) return null;
    return Math.min(...availableVariants.map((v) => v.price));
  }

  return this.price;
};

/**
 * Get the maximum price (from variants or base price)
 * @returns {number|null} Maximum price or null if quote-based
 */
ListingSchema.methods.getMaxPrice = function () {
  if (this.quoteSettings?.enabled) {
    return this.quoteSettings.maxPrice || null;
  }

  if (this.variants && this.variants.length > 0) {
    const availableVariants = this.variants.filter((v) => v.isAvailable);
    if (availableVariants.length === 0) return null;
    return Math.max(...availableVariants.map((v) => v.price));
  }

  return this.price;
};

/**
 * Get the total stock (sum of all variant stocks or base stock)
 * @returns {number|null} Total stock or null for services
 */
ListingSchema.methods.getTotalStock = function () {
  if (this.type === "service") return null;

  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((total, v) => {
      if (v.isAvailable && v.stock !== undefined) {
        return total + v.stock;
      }
      return total;
    }, 0);
  }

  return this.stock || 0;
};

/**
 * Get a specific variant by ID
 * @param {ObjectId|string} variantId
 * @returns {Object|null} Variant subdocument or null
 */
ListingSchema.methods.getVariant = function (variantId) {
  if (!this.variants || this.variants.length === 0) return null;
  return this.variants.id(variantId) || null;
};

/**
 * Get available variants only
 * @returns {Array} Array of available variants
 */
ListingSchema.methods.getAvailableVariants = function () {
  if (!this.variants) return [];
  return this.variants.filter((v) => v.isAvailable);
};

/**
 * Check if a specific variant is in stock
 * @param {ObjectId|string} variantId
 * @returns {boolean}
 */
ListingSchema.methods.isVariantInStock = function (variantId) {
  const variant = this.getVariant(variantId);
  if (!variant) return false;
  if (this.type === "service") return variant.isAvailable;
  return variant.isAvailable && variant.stock > 0;
};

/**
 * Deduct stock from a specific variant
 * @param {ObjectId|string} variantId
 * @param {number} quantity
 * @returns {Promise<boolean>} Success status
 */
ListingSchema.methods.deductVariantStock = async function (
  variantId,
  quantity
) {
  const variant = this.getVariant(variantId);
  if (!variant) {
    throw new Error(`Variant ${variantId} not found`);
  }
  if (this.type === "service") return true; // Services don't have stock

  if (variant.stock < quantity) {
    throw new Error(`Insufficient stock for variant ${variantId}`);
  }
  variant.stock -= quantity;
  await this.save();
  return true;
};

/**
 * Restore stock to a specific variant (for order cancellation)
 * @param {ObjectId|string} variantId
 * @param {number} quantity
 * @returns {Promise<boolean>} Success status
 */
ListingSchema.methods.restoreVariantStock = async function (
  variantId,
  quantity
) {
  const variant = this.getVariant(variantId);
  if (!variant) {
    throw new Error(`Variant ${variantId} not found`);
  }
  if (this.type === "service") return true; // Services don't have stock

  variant.stock += quantity;
  await this.save();
  return true;
};

// ======================   Static Methods   ========================

// Static method to get listings by seller
ListingSchema.statics.findBySeller = function (userId, options = {}) {
  const query = { "seller.userId": userId, isAvailable: true };
  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;

  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get merchant listings
ListingSchema.statics.findByMerchant = function (shopSlug, options = {}) {
  const query = {
    "seller.shopSlug": shopSlug,
    "seller.userType": "merchant",
    isAvailable: true,
  };

  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to update merchant info across all listings (rare operation)
ListingSchema.statics.updateMerchantInfo = async function (
  userId,
  merchantData
) {
  const updateData = {};

  if (merchantData.shopName !== undefined) {
    updateData["seller.shopName"] = merchantData.shopName;
  }
  if (merchantData.shopSlug !== undefined) {
    updateData["seller.shopSlug"] = merchantData.shopSlug;
  }
  if (merchantData.isVerified !== undefined) {
    updateData["seller.isVerifiedMerchant"] = merchantData.isVerified;
  }
  if (merchantData.username !== undefined) {
    updateData["seller.username"] = merchantData.username;
  }

  if (Object.keys(updateData).length > 0) {
    const result = await this.updateMany(
      { "seller.userId": userId },
      { $set: updateData }
    );

    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  return { modifiedCount: 0, matchedCount: 0 };
};

// ======================   Middleware   ========================

// Pre-save middleware to populate seller information
ListingSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("seller.userId")) {
    try {
      const User = mongoose.model("User");
      const user = await User.findById(this.seller.userId).select(
        "profile.username roles merchantDetails"
      );

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
      }

      // Set basic seller info
      this.seller.username = user.profile.username;
      this.seller.userType = user.roles.includes("merchant")
        ? "merchant"
        : "consumer";

      // Validate that username was populated
      if (!this.seller.username) {
        const error = new Error("User must have a username to create listings");
        error.statusCode = 400;
        return next(error);
      }

      // Set merchant-specific info if user is a merchant
      if (this.seller.userType === "merchant" && user.merchantDetails) {
        this.seller.shopSlug = user.merchantDetails.shopSlug || null;
        this.seller.shopName = user.merchantDetails.shopName || null;
        this.seller.isVerifiedMerchant =
          user.merchantDetails.isVerified || false;
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
