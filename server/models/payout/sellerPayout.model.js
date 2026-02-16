const mongoose = require("mongoose");

const {
  PayoutStatus,
  PayoutMethod,
  PayoutFailureReason,
  PayoutLimits,
} = require("../../utils/enums/payout.enum");

// Seller Payout Schema - tracks individual payout requests
const sellerPayoutSchema = new mongoose.Schema(
  {
    // Reference to seller
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Payout amount
    amount: {
      type: Number,
      required: [true, "Payout amount is required"],
      min: [
        PayoutLimits.MIN_PAYOUT_AMOUNT,
        `Minimum payout is RM ${PayoutLimits.MIN_PAYOUT_AMOUNT}`,
      ],
    },

    // Processing fee (if any)
    processingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Net amount to be received
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payout status
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
      index: true,
    },

    // Payout method
    method: {
      type: String,
      enum: Object.values(PayoutMethod),
      default: PayoutMethod.BANK_TRANSFER,
    },

    // Bank details snapshot at time of payout
    bankDetailsSnapshot: {
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountHolderName: String,
    },

    // Request type
    requestType: {
      type: String,
      enum: ["manual", "scheduled", "forced"],
      required: true,
      index: true,
    },

    // Processing timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processingStartedAt: Date,
    completedAt: Date,
    failedAt: Date,

    // Bank transfer reference
    bankReference: {
      transactionId: String,
      referenceNumber: String,
      bankResponseCode: String,
      bankResponseMessage: String,
    },

    // Failure details
    failure: {
      reason: {
        type: String,
        enum: Object.values(PayoutFailureReason),
      },
      message: String,
      retryCount: {
        type: Number,
        default: 0,
      },
      maxRetries: {
        type: Number,
        default: 3,
      },
      nextRetryAt: Date,
      canRetry: {
        type: Boolean,
        default: true,
      },
    },

    // Admin notes
    adminNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status history
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(PayoutStatus),
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: String,
      },
    ],

    // Payout period (what transactions this covers)
    period: {
      from: Date,
      to: Date,
      transactionCount: Number,
    },

    // Breakdown of what's included in this payout
    breakdown: {
      orderEarnings: {
        type: Number,
        default: 0,
      },
      quoteEarnings: {
        type: Number,
        default: 0,
      },
      refundsDeducted: {
        type: Number,
        default: 0,
      },
      adjustments: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============================================================================
// INDEXES
// ============================================================================

sellerPayoutSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
sellerPayoutSchema.index({ status: 1, requestedAt: -1 });
sellerPayoutSchema.index({ "failure.nextRetryAt": 1 });

// ======================   Virtuals   ========================

// Check if payout can be cancelled
sellerPayoutSchema.virtual("canCancel").get(function () {
  return this.status === PayoutStatus.PENDING;
});

// Check if payout can be retried
sellerPayoutSchema.virtual("canRetry").get(function () {
  return (
    this.status === PayoutStatus.FAILED &&
    this.failure?.canRetry &&
    this.failure?.retryCount < this.failure?.maxRetries
  );
});

// ======================   Instance Methods   ========================

// Add status history entry
sellerPayoutSchema.methods.addStatusHistory = function (
  status,
  changedBy = null,
  note = null,
) {
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy,
    note,
  });
};

// Start processing
sellerPayoutSchema.methods.startProcessing = function () {
  this.status = PayoutStatus.PROCESSING;
  this.processingStartedAt = new Date();
  this.addStatusHistory(PayoutStatus.PROCESSING, null, "Processing started");
};

// Mark as completed
sellerPayoutSchema.methods.markCompleted = function (bankReference) {
  this.status = PayoutStatus.COMPLETED;
  this.completedAt = new Date();
  this.bankReference = bankReference;
  this.addStatusHistory(PayoutStatus.COMPLETED, null, "Transfer completed");
};

// Mark as failed
sellerPayoutSchema.methods.markFailed = function (reason, message) {
  this.status = PayoutStatus.FAILED;
  this.failedAt = new Date();
  this.failure = {
    ...this.failure,
    reason,
    message,
    retryCount: (this.failure?.retryCount || 0) + 1,
  };

  // Set retry if allowed
  if (this.failure.retryCount < this.failure.maxRetries) {
    // Retry in 24 hours
    this.failure.nextRetryAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    this.failure.canRetry = true;
  } else {
    this.failure.canRetry = false;
  }

  this.addStatusHistory(PayoutStatus.FAILED, null, `Failed: ${message}`);
};

// Put on hold
sellerPayoutSchema.methods.putOnHold = function (reason, adminId) {
  this.status = PayoutStatus.ON_HOLD;
  this.addStatusHistory(PayoutStatus.ON_HOLD, adminId, reason);
  this.adminNotes.push({
    note: `Put on hold: ${reason}`,
    addedBy: adminId,
    addedAt: new Date(),
  });
};

// Cancel payout
sellerPayoutSchema.methods.cancel = function (cancelledBy, reason) {
  this.status = PayoutStatus.CANCELLED;
  this.addStatusHistory(PayoutStatus.CANCELLED, cancelledBy, reason);
};

// ======================   Pre-Save Hooks   ========================

// Calculate net amount before save
sellerPayoutSchema.pre("save", function (next) {
  if (this.isNew) {
    this.netAmount = this.amount - this.processingFee;
    this.addStatusHistory(PayoutStatus.PENDING, null, "Payout requested");
  }
  next();
});

// ======================   Statics   ========================

// Get payouts for seller
sellerPayoutSchema.statics.getBySeller = function (sellerId, options = {}) {
  const { status, page = 1, limit = 10 } = options;

  const query = { sellerId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Find payouts ready for retry
sellerPayoutSchema.statics.findReadyForRetry = function () {
  return this.find({
    status: PayoutStatus.FAILED,
    "failure.canRetry": true,
    "failure.nextRetryAt": { $lte: new Date() },
  });
};

// Get payout statistics for seller
sellerPayoutSchema.statics.getStats = async function (sellerId) {
  const stats = await this.aggregate([
    { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
    };
    return acc;
  }, {});
};

const SellerPayout = mongoose.model("SellerPayout", sellerPayoutSchema);

module.exports = { SellerPayout, sellerPayoutSchema };
