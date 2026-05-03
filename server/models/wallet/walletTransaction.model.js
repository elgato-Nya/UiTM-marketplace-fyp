const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "fee"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

walletTransactionSchema.index({ sellerId: 1, createdAt: -1 });
walletTransactionSchema.index(
  { sellerId: 1, orderId: 1, type: 1 },
  { unique: true, partialFilterExpression: { orderId: { $exists: true } } },
);

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema,
);

module.exports = { WalletTransaction, walletTransactionSchema };
