const mongoose = require("mongoose");

const { ListingCategory } = require("../../utils/enums/listing.enum");
const {
  ListingValidator,
  listingErrorMessages,
  userErrorMessages,
} = require("../../validators");

const { isValidListingName, isValidListingDescription, isValidImagesArray } =
  ListingValidator;

/**
 * Listing Model
 *
 * PURPOSE: Basic listing schema for e-commerce
 * FEATURES: Name, description, price, category, images, stock
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
      required: [true, listingErrorMessages.price.required],
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
      required: function () {
        return this.type === "product"; // Only required for products
      },
      min: [0, "Stock cannot be negative"],
      default: function () {
        return this.type === "product" ? 0 : undefined;
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

// Virtual for checking if listing is in stock
ListingSchema.virtual("inStock").get(function () {
  if (this.type === "service") return true; // Services are always "in stock"
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
