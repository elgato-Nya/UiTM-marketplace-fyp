const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

withdrawalRequestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema,
);

module.exports = { WithdrawalRequest, withdrawalRequestSchema };