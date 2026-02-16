const mongoose = require("mongoose");

const {
  PayoutStatus,
  PayoutSchedule,
  PayoutMethod,
  PayoutLimits,
  PayoutTransactionType,
  PayoutFailureReason,
} = require("../../utils/enums/payout.enum");

// Seller Balance Schema - tracks available balance and payout preferences
const sellerBalanceSchema = new mongoose.Schema(
  {
    // Reference to seller
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Balance amounts (in RM)
    availableBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },

    // Pending balance (from orders in processing, not yet settled)
    pendingBalance: {
      type: Number,
      default: 0,
      min: [0, "Pending balance cannot be negative"],
    },

    // Total lifetime earnings
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total amount paid out
    totalPaidOut: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total platform fees paid
    totalPlatformFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Payout preferences
    payoutSettings: {
      schedule: {
        type: String,
        enum: Object.values(PayoutSchedule),
        default: PayoutSchedule.MONTHLY,
      },
      autoPayoutEnabled: {
        type: Boolean,
        default: true,
      },
      minimumPayoutAmount: {
        type: Number,
        default: PayoutLimits.MIN_PAYOUT_AMOUNT,
        min: PayoutLimits.MIN_PAYOUT_AMOUNT,
      },
    },

    // Bank account details for payout
    bankDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      bankCode: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountHolderName: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
    },

    // Track oldest unpaid transaction for forced payout calculation
    oldestUnpaidTransactionDate: {
      type: Date,
    },

    // Last payout information
    lastPayout: {
      amount: Number,
      date: Date,
      payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerPayout",
      },
    },

    // Next scheduled payout (for auto-payout)
    nextScheduledPayout: {
      type: Date,
    },

    // Account status
    status: {
      type: String,
      enum: ["active", "suspended", "pending_verification"],
      default: "active",
      index: true,
    },

    suspensionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ======================   Virtuals   ========================

// Total balance (available + pending)
sellerBalanceSchema.virtual("totalBalance").get(function () {
  return this.availableBalance + this.pendingBalance;
});

// Check if eligible for payout
sellerBalanceSchema.virtual("canRequestPayout").get(function () {
  return (
    this.availableBalance >= PayoutLimits.MIN_PAYOUT_AMOUNT &&
    this.status === "active" &&
    this.bankDetails?.isVerified
  );
});

// Days until forced payout
sellerBalanceSchema.virtual("daysUntilForcedPayout").get(function () {
  if (!this.oldestUnpaidTransactionDate) return PayoutLimits.MAX_HOLD_DAYS;

  const now = new Date();
  const oldest = new Date(this.oldestUnpaidTransactionDate);
  const daysPassed = Math.floor((now - oldest) / (1000 * 60 * 60 * 24));

  return Math.max(0, PayoutLimits.MAX_HOLD_DAYS - daysPassed);
});

// Check if approaching max balance threshold
sellerBalanceSchema.virtual("isApproachingMaxBalance").get(function () {
  return this.availableBalance >= PayoutLimits.MAX_BALANCE_THRESHOLD * 0.8;
});

// Check if forced payout needed
sellerBalanceSchema.virtual("needsForcedPayout").get(function () {
  // Force payout if balance exceeds threshold
  if (this.availableBalance >= PayoutLimits.MAX_BALANCE_THRESHOLD) {
    return true;
  }

  // Force payout if funds held too long
  if (this.daysUntilForcedPayout <= 0 && this.availableBalance > 0) {
    return true;
  }

  return false;
});

// ======================   Instance Methods   ========================

// Add to available balance
sellerBalanceSchema.methods.addToAvailable = function (
  amount,
  transactionDate,
) {
  this.availableBalance += amount;
  this.totalEarned += amount;

  // Track oldest unpaid transaction
  if (
    !this.oldestUnpaidTransactionDate ||
    transactionDate < this.oldestUnpaidTransactionDate
  ) {
    this.oldestUnpaidTransactionDate = transactionDate;
  }
};

// Add to pending balance
sellerBalanceSchema.methods.addToPending = function (amount) {
  this.pendingBalance += amount;
};

// Move from pending to available (when order completes)
sellerBalanceSchema.methods.settlePending = function (amount, transactionDate) {
  if (this.pendingBalance >= amount) {
    this.pendingBalance -= amount;
    this.addToAvailable(amount, transactionDate);
  }
};

// Deduct for payout
sellerBalanceSchema.methods.deductForPayout = function (amount) {
  if (this.availableBalance >= amount) {
    this.availableBalance -= amount;
    this.totalPaidOut += amount;
    this.lastPayout = {
      amount,
      date: new Date(),
    };

    // Reset oldest unpaid date if balance is zero
    if (this.availableBalance === 0) {
      this.oldestUnpaidTransactionDate = null;
    }
  }
};

// Deduct platform fee
sellerBalanceSchema.methods.deductPlatformFee = function (amount) {
  this.totalPlatformFees += amount;
};

// Calculate next scheduled payout date
sellerBalanceSchema.methods.calculateNextScheduledPayout = function () {
  const now = new Date();

  if (this.payoutSettings.schedule === PayoutSchedule.WEEKLY) {
    // Next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    this.nextScheduledPayout = new Date(
      now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000,
    );
    this.nextScheduledPayout.setHours(0, 0, 0, 0);
  } else if (this.payoutSettings.schedule === PayoutSchedule.MONTHLY) {
    // 1st of next month
    this.nextScheduledPayout = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );
  } else {
    // Manual - no scheduled payout
    this.nextScheduledPayout = null;
  }
};

// ======================   Statics   ========================

// Get or create balance for seller
sellerBalanceSchema.statics.getOrCreate = async function (sellerId) {
  let balance = await this.findOne({ sellerId });

  if (!balance) {
    balance = new this({ sellerId });
    await balance.save();
  }

  return balance;
};

// Find sellers needing forced payout
sellerBalanceSchema.statics.findNeedingForcedPayout = function () {
  const maxHoldDate = new Date(
    Date.now() - PayoutLimits.MAX_HOLD_DAYS * 24 * 60 * 60 * 1000,
  );

  return this.find({
    status: "active",
    "bankDetails.isVerified": true,
    availableBalance: { $gte: PayoutLimits.MIN_PAYOUT_AMOUNT },
    $or: [
      { availableBalance: { $gte: PayoutLimits.MAX_BALANCE_THRESHOLD } },
      { oldestUnpaidTransactionDate: { $lte: maxHoldDate } },
    ],
  });
};

// Find sellers due for scheduled payout
sellerBalanceSchema.statics.findDueForScheduledPayout = function () {
  return this.find({
    status: "active",
    "bankDetails.isVerified": true,
    "payoutSettings.autoPayoutEnabled": true,
    availableBalance: { $gte: PayoutLimits.MIN_PAYOUT_AMOUNT },
    nextScheduledPayout: { $lte: new Date() },
  });
};

const SellerBalance = mongoose.model("SellerBalance", sellerBalanceSchema);

module.exports = { SellerBalance, sellerBalanceSchema };
