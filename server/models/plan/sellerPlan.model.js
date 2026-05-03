const mongoose = require("mongoose");

const sellerPlanSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["basic", "pro", "store"],
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
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
    freeFeaturedSlotsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    freeFeaturedSlotsMonthKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

sellerPlanSchema.index({ sellerId: 1, isActive: 1, expiresAt: -1 });

sellerPlanSchema.methods.isExpired = function () {
  return new Date(this.expiresAt).getTime() <= Date.now();
};

const SellerPlan = mongoose.model("SellerPlan", sellerPlanSchema);

module.exports = { SellerPlan, sellerPlanSchema };