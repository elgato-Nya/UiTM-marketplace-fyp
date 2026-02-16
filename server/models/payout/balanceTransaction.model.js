const mongoose = require("mongoose");

const { PayoutTransactionType } = require("../../utils/enums/payout.enum");

// Balance Transaction Schema - audit trail for all balance changes
const balanceTransactionSchema = new mongoose.Schema(
  {
    // Reference to seller
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Transaction type
    type: {
      type: String,
      enum: Object.values(PayoutTransactionType),
      required: true,
      index: true,
    },

    // Amount (positive for credit, negative for debit)
    amount: {
      type: Number,
      required: true,
    },

    // Running balance after this transaction
    balanceAfter: {
      type: Number,
      required: true,
    },

    // Description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Reference to source document
    reference: {
      // Type of reference
      refType: {
        type: String,
        enum: ["Order", "QuoteRequest", "SellerPayout", "Refund", "Adjustment"],
      },
      // Reference document ID
      refId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      // Human-readable reference number
      refNumber: String,
    },

    // Fee breakdown (for order/quote payments)
    fees: {
      platformFee: {
        type: Number,
        default: 0,
      },
      stripeFee: {
        type: Number,
        default: 0,
      },
    },

    // Gross amount before fees (for payments)
    grossAmount: {
      type: Number,
    },

    // Status (for pending transactions)
    status: {
      type: String,
      enum: ["pending", "settled", "reversed"],
      default: "settled",
      index: true,
    },

    // Settlement date (when pending becomes available)
    settledAt: Date,

    // Notes
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Admin who made adjustment (for manual adjustments)
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
balanceTransactionSchema.index({ sellerId: 1, createdAt: -1 });
balanceTransactionSchema.index({ sellerId: 1, type: 1, createdAt: -1 });
balanceTransactionSchema.index({
  "reference.refType": 1,
  "reference.refId": 1,
});
balanceTransactionSchema.index({ status: 1, settledAt: 1 });

// ======================   Virtuals   ========================

// Check if transaction is credit (money in)
balanceTransactionSchema.virtual("isCredit").get(function () {
  return this.amount > 0;
});

// Get absolute amount
balanceTransactionSchema.virtual("absoluteAmount").get(function () {
  return Math.abs(this.amount);
});

// ======================   Statics   ========================

// Get transactions for seller
balanceTransactionSchema.statics.getBySeller = function (
  sellerId,
  options = {},
) {
  const { type, status, page = 1, limit = 20, startDate, endDate } = options;

  const query = { sellerId };

  if (type) query.type = type;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get transaction summary for period
balanceTransactionSchema.statics.getSummary = async function (
  sellerId,
  startDate,
  endDate,
) {
  const summary = await this.aggregate([
    {
      $match: {
        sellerId: mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: "settled",
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalPlatformFees: { $sum: "$fees.platformFee" },
        totalStripeFees: { $sum: "$fees.stripeFee" },
      },
    },
  ]);

  return summary.reduce(
    (acc, item) => {
      acc.byType[item._id] = {
        count: item.count,
        amount: item.totalAmount,
        platformFees: item.totalPlatformFees,
        stripeFees: item.totalStripeFees,
      };

      // Calculate totals
      if (item.totalAmount > 0) {
        acc.totalCredits += item.totalAmount;
      } else {
        acc.totalDebits += Math.abs(item.totalAmount);
      }
      acc.totalPlatformFees += item.totalPlatformFees;
      acc.totalStripeFees += item.totalStripeFees;

      return acc;
    },
    {
      byType: {},
      totalCredits: 0,
      totalDebits: 0,
      totalPlatformFees: 0,
      totalStripeFees: 0,
    },
  );
};

// Find pending transactions ready for settlement
balanceTransactionSchema.statics.findReadyForSettlement = function (
  settlementDelayHours = 24,
) {
  const settlementThreshold = new Date(
    Date.now() - settlementDelayHours * 60 * 60 * 1000,
  );

  return this.find({
    status: "pending",
    createdAt: { $lte: settlementThreshold },
  });
};

// Create order payment transaction
balanceTransactionSchema.statics.createOrderPayment = async function (data) {
  const {
    sellerId,
    orderId,
    orderNumber,
    grossAmount,
    platformFee,
    stripeFee,
    currentBalance,
    isPending = false,
  } = data;

  const netAmount = grossAmount - platformFee - stripeFee;

  return this.create({
    sellerId,
    type: PayoutTransactionType.ORDER_PAYMENT,
    amount: netAmount,
    balanceAfter: currentBalance + netAmount,
    description: `Payment for order ${orderNumber}`,
    grossAmount,
    fees: {
      platformFee,
      stripeFee,
    },
    reference: {
      refType: "Order",
      refId: orderId,
      refNumber: orderNumber,
    },
    status: isPending ? "pending" : "settled",
  });
};

// Create payout transaction
balanceTransactionSchema.statics.createPayoutTransaction = async function (
  data,
) {
  const { sellerId, payoutId, amount, currentBalance } = data;

  return this.create({
    sellerId,
    type: PayoutTransactionType.PAYOUT,
    amount: -amount, // Negative for debit
    balanceAfter: currentBalance - amount,
    description: "Payout to bank account",
    reference: {
      refType: "SellerPayout",
      refId: payoutId,
    },
    status: "settled",
  });
};

const BalanceTransaction = mongoose.model(
  "BalanceTransaction",
  balanceTransactionSchema,
);

module.exports = { BalanceTransaction, balanceTransactionSchema };
