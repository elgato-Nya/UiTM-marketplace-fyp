const mongoose = require("mongoose");

const featuredListingSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["wallet", "free_slot"],
      default: "wallet",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

featuredListingSchema.index({ listingId: 1, isActive: 1 });
featuredListingSchema.index({ sellerId: 1, createdAt: -1 });

const FeaturedListing = mongoose.model(
  "FeaturedListing",
  featuredListingSchema,
);

module.exports = { FeaturedListing, featuredListingSchema };