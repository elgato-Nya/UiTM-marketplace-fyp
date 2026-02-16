const mongoose = require("mongoose");

const {
  QuoteStatus,
  QuoteCancelReason,
  QuotePriority,
  QuoteExpiryDays,
} = require("../../utils/enums/quote.enum");
const {
  PaymentMethod,
  PaymentStatus,
} = require("../../utils/enums/order.enum");

// Custom field values from buyer
const customFieldValueSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fieldType: {
      type: String,
      enum: ["text", "textarea", "number", "select", "date"],
    },
  },
  { _id: false },
);

// Status history tracking
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedByRole: {
      type: String,
      enum: ["buyer", "seller", "system", "admin"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false },
);

// Seller's quote response details
const sellerQuoteSchema = new mongoose.Schema(
  {
    quotedPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    estimatedDuration: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    depositRequired: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      min: 0,
    },
    depositPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    validUntil: {
      type: Date,
    },
    quotedAt: {
      type: Date,
      default: Date.now,
    },
    terms: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false },
);

// Main Quote Request Schema
const quoteRequestSchema = new mongoose.Schema(
  {
    // Reference to the service listing
    listing: {
      listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: [true, "Listing ID is required"],
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      // Denormalized listing image for quick access
      image: {
        type: String,
        default: null,
      },
      // Snapshot of quote settings at time of request
      quoteSettingsSnapshot: {
        minPrice: Number,
        maxPrice: Number,
        responseTime: String,
        requiresDeposit: Boolean,
        depositPercentage: Number,
      },
    },

    // Buyer information
    buyer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Buyer ID is required"],
        index: true,
      },
      username: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    // Seller information (denormalized for performance)
    seller: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seller ID is required"],
        index: true,
      },
      username: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      shopName: String,
      shopSlug: String,
    },

    // Buyer's request details
    request: {
      message: {
        type: String,
        required: [true, "Request message is required"],
        trim: true,
        maxlength: [2000, "Message cannot exceed 2000 characters"],
      },
      budget: {
        type: Number,
        min: [0, "Budget cannot be negative"],
      },
      timeline: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      priority: {
        type: String,
        enum: Object.values(QuotePriority),
        default: QuotePriority.NORMAL,
      },
      customFieldValues: [customFieldValueSchema],
    },

    // Seller's quote response
    sellerQuote: sellerQuoteSchema,

    // Current status
    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.PENDING,
      index: true,
    },

    // Status history
    statusHistory: [statusHistorySchema],

    // Expiry tracking
    expiresAt: {
      type: Date,
      index: true,
    },

    // Payment details (when quote is accepted and paid)
    payment: {
      method: {
        type: String,
        enum: Object.values(PaymentMethod),
      },
      status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
      },
      stripePaymentIntentId: String,
      transactionId: String,
      amount: Number,
      depositPaid: Number,
      remainingAmount: Number,
      paidAt: Date,
      depositPaidAt: Date,
      completedAt: Date,
    },

    // Cancellation details
    cancellation: {
      reason: {
        type: String,
        enum: Object.values(QuoteCancelReason),
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelledByRole: {
        type: String,
        enum: ["buyer", "seller", "admin", "system"],
      },
      note: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      cancelledAt: Date,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
      },
    },

    // Service completion tracking
    service: {
      startedAt: Date,
      completedAt: Date,
      buyerConfirmedAt: Date,
      sellerConfirmedAt: Date,
      completionNote: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

    // Email notification tracking
    notifications: {
      requestSentToSeller: { type: Boolean, default: false },
      quoteSentToBuyer: { type: Boolean, default: false },
      expiryWarningSent: { type: Boolean, default: false },
      paymentConfirmationSent: { type: Boolean, default: false },
      completionSent: { type: Boolean, default: false },
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for common queries
quoteRequestSchema.index({ "buyer.userId": 1, status: 1, createdAt: -1 });
quoteRequestSchema.index({ "seller.userId": 1, status: 1, createdAt: -1 });
quoteRequestSchema.index({ status: 1, expiresAt: 1 });
quoteRequestSchema.index({ "listing.listingId": 1, createdAt: -1 });

// ======================   Virtuals   ========================

// Check if quote is expired
quoteRequestSchema.virtual("isExpired").get(function () {
  if (this.expiresAt && new Date() > this.expiresAt) {
    return true;
  }
  return false;
});

// Days until expiry
quoteRequestSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  const diff = expiry - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Check if seller can respond
quoteRequestSchema.virtual("canSellerRespond").get(function () {
  return this.status === QuoteStatus.PENDING && !this.isExpired;
});

// Check if buyer can accept/reject
quoteRequestSchema.virtual("canBuyerDecide").get(function () {
  return this.status === QuoteStatus.QUOTED && !this.isExpired;
});

// Check if quote can be paid
quoteRequestSchema.virtual("canPay").get(function () {
  return this.status === QuoteStatus.ACCEPTED && !this.isExpired;
});

// ======================   Instance Methods   ========================

// Set expiry date based on current status
quoteRequestSchema.methods.setExpiry = function () {
  const now = new Date();

  switch (this.status) {
    case QuoteStatus.PENDING:
      this.expiresAt = new Date(
        now.getTime() + QuoteExpiryDays.PENDING_EXPIRY * 24 * 60 * 60 * 1000,
      );
      break;
    case QuoteStatus.QUOTED:
      this.expiresAt = new Date(
        now.getTime() + QuoteExpiryDays.QUOTED_EXPIRY * 24 * 60 * 60 * 1000,
      );
      break;
    case QuoteStatus.ACCEPTED:
      this.expiresAt = new Date(
        now.getTime() + QuoteExpiryDays.ACCEPTED_EXPIRY * 24 * 60 * 60 * 1000,
      );
      break;
    default:
      this.expiresAt = null; // No expiry for final states
  }
};

// Add status history entry
quoteRequestSchema.methods.addStatusHistory = function (
  status,
  changedBy,
  role,
  note = null,
) {
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy,
    changedByRole: role,
    note,
  });
};

// Update status with history tracking
quoteRequestSchema.methods.updateStatus = function (
  newStatus,
  changedBy,
  role,
  note = null,
) {
  this.status = newStatus;
  this.addStatusHistory(newStatus, changedBy, role, note);
  this.setExpiry();
};

// Provide seller quote
quoteRequestSchema.methods.provideQuote = function (quoteData, sellerId) {
  this.sellerQuote = {
    ...quoteData,
    quotedAt: new Date(),
    validUntil: new Date(
      Date.now() + QuoteExpiryDays.QUOTED_EXPIRY * 24 * 60 * 60 * 1000,
    ),
  };
  this.updateStatus(QuoteStatus.QUOTED, sellerId, "seller", "Quote provided");
};

// Accept quote (by buyer)
quoteRequestSchema.methods.acceptQuote = function (buyerId) {
  this.updateStatus(QuoteStatus.ACCEPTED, buyerId, "buyer", "Quote accepted");
};

// Reject quote (by buyer)
quoteRequestSchema.methods.rejectQuote = function (buyerId, reason = null) {
  this.updateStatus(
    QuoteStatus.REJECTED,
    buyerId,
    "buyer",
    reason || "Quote rejected",
  );
};

// Mark as expired (by system)
quoteRequestSchema.methods.markExpired = function () {
  this.updateStatus(QuoteStatus.EXPIRED, null, "system", "Quote expired");
};

// Cancel quote
quoteRequestSchema.methods.cancelQuote = function (
  userId,
  role,
  reason,
  note = null,
) {
  this.cancellation = {
    reason,
    cancelledBy: userId,
    cancelledByRole: role,
    note,
    cancelledAt: new Date(),
  };
  this.updateStatus(
    QuoteStatus.CANCELLED,
    userId,
    role,
    `Cancelled: ${reason}`,
  );
};

// Mark payment received
quoteRequestSchema.methods.markPaid = function (paymentData) {
  this.payment = {
    ...this.payment,
    ...paymentData,
    status: PaymentStatus.PAID,
    paidAt: new Date(),
  };
  this.updateStatus(
    QuoteStatus.PAID,
    this.buyer.userId,
    "buyer",
    "Payment received",
  );
};

// Start service
quoteRequestSchema.methods.startService = function (sellerId) {
  this.service.startedAt = new Date();
  this.updateStatus(
    QuoteStatus.IN_PROGRESS,
    sellerId,
    "seller",
    "Service started",
  );
};

// Complete service
quoteRequestSchema.methods.completeService = function (sellerId, note = null) {
  this.service.completedAt = new Date();
  this.service.sellerConfirmedAt = new Date();
  this.service.completionNote = note;
  this.updateStatus(
    QuoteStatus.COMPLETED,
    sellerId,
    "seller",
    "Service completed",
  );
};

// ======================   Pre-Save Hooks   ========================

// Set initial expiry on creation
quoteRequestSchema.pre("save", function (next) {
  if (this.isNew) {
    this.setExpiry();
    this.addStatusHistory(
      QuoteStatus.PENDING,
      this.buyer.userId,
      "buyer",
      "Quote request submitted",
    );
  }
  next();
});

// ======================   Statics   ========================

// Find quotes expiring soon (for notification job)
quoteRequestSchema.statics.findExpiringSoon = function (daysBeforeExpiry = 2) {
  const now = new Date();
  const threshold = new Date(
    now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000,
  );

  return this.find({
    status: {
      $in: [QuoteStatus.PENDING, QuoteStatus.QUOTED, QuoteStatus.ACCEPTED],
    },
    expiresAt: { $lte: threshold, $gt: now },
    isDeleted: false,
    "notifications.expiryWarningSent": false,
  });
};

// Find expired quotes (for cleanup job)
quoteRequestSchema.statics.findExpired = function () {
  return this.find({
    status: {
      $in: [QuoteStatus.PENDING, QuoteStatus.QUOTED, QuoteStatus.ACCEPTED],
    },
    expiresAt: { $lte: new Date() },
    isDeleted: false,
  });
};

// Get quotes for buyer
quoteRequestSchema.statics.getByBuyer = function (buyerId, options = {}) {
  const { status, page = 1, limit = 10 } = options;

  const query = {
    "buyer.userId": buyerId,
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get quotes for seller
quoteRequestSchema.statics.getBySeller = function (sellerId, options = {}) {
  const { status, page = 1, limit = 10 } = options;

  const query = {
    "seller.userId": sellerId,
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const QuoteRequest = mongoose.model("QuoteRequest", quoteRequestSchema);

module.exports = { QuoteRequest, quoteRequestSchema };
