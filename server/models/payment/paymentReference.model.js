const mongoose = require("mongoose");

const paymentReferenceSchema = new mongoose.Schema(
  {
    referenceNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    billCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purpose: {
      type: String,
      enum: ["plan_upgrade"],
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["basic", "pro", "store"],
      default: "pro",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true,
    },
    callbackProcessedAt: Date,
    callbackStatus: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

paymentReferenceSchema.index({ sellerId: 1, purpose: 1, createdAt: -1 });

const PaymentReference = mongoose.model(
  "PaymentReference",
  paymentReferenceSchema,
);

module.exports = { PaymentReference, paymentReferenceSchema };
