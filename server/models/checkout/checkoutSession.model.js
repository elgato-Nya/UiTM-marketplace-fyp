// TODO: the validators and custom error messages, check about required fields etc.
const mongoose = require("mongoose");
const {
  PaymentMethod,
  DeliveryMethod,
} = require("../../utils/enums/order.enum");
const logger = require("../../utils/logger");

// Import schemas (following your order model pattern)
const stockReservationSchema = require("./stockReservation.schema");
const checkoutItemSchema = require("./checkoutItem.schema");
const sellerGroupSchema = require("./sellerGroup.schema");
const pricingSummarySchema = require("./pricingSummary.schema");
const deliveryAddressSchema = require("../order/deliveryAddress.schema");

const checkoutSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: ["cart", "direct"],
      required: true,
    },
    items: {
      type: [checkoutItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Checkout session must contain at least one item",
      },
    },
    // items grouped for each seller
    sellerGroups: {
      type: [sellerGroupSchema],
      required: true,
      validate: {
        validator: function (groups) {
          return groups && groups.length > 0;
        },
        message: "Checkout session must contain at least one seller group",
      },
    },

    // Overall pricing summary
    pricing: {
      type: pricingSummarySchema,
      required: true,
    },
    // Delivery details (using existing order schema)
    deliveryMethod: {
      type: String,
      enum: Object.values(DeliveryMethod),
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeClientSecret: {
      type: String,
      select: false,
    },

    // Session status
    status: {
      type: String,
      enum: [
        "pending",
        "payment_intent_created",
        "completed",
        "expired",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // Stock reservations (for releasing on expiry/cancel)
    stockReservations: {
      type: [stockReservationSchema],
      default: [],
    },

    // TODO: check where to implement Validation results. i mean is it relevant to store them in DB?
    validationErrors: {
      type: [String],
      default: [],
    },

    // Created orders (after successful payment/confirmation)
    createdOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    // Session expiry
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
checkoutSessionSchema.index({ userId: 1, status: 1 });
checkoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ==================== MIDDLEWARE ====================

/**
 * Pre-save: Set expiry time if not set
 */
checkoutSessionSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    // 10 minutes from now
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

/**
 * Post-save: Log session creation
 */
checkoutSessionSchema.post("save", function (doc) {
  if (doc.wasNew) {
    logger.info("Checkout session created", {
      sessionId: doc._id,
      userId: doc.userId,
      sessionType: doc.sessionType,
      itemCount: doc.items.length,
      sellerCount: doc.sellerGroups.length,
      totalAmount: doc.pricing.totalAmount,
      expiresAt: doc.expiresAt,
      action: "checkout_session_created",
    });
  }
});

// ==================== METHODS ====================

/**
 * Check if session can be modified
 */
checkoutSessionSchema.methods.canModify = function () {
  return !this.isExpired && this.status === "pending";
};

/**
 * Mark session as completed
 */
checkoutSessionSchema.methods.markCompleted = function (orderIds = []) {
  this.status = "completed";
  this.createdOrders = orderIds;
  return this;
};

/**
 * Mark session as cancelled
 */
checkoutSessionSchema.methods.markCancelled = function () {
  this.status = "cancelled";
  return this;
};

// ==================== STATIC METHODS ====================

/**
 * Find active session for user
 */
checkoutSessionSchema.statics.findActiveSession = async function (userId) {
  return this.findOne({
    userId,
    status: { $in: ["pending", "payment_intent_created"] },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

/**
 * Cancel all active sessions for user
 */
checkoutSessionSchema.statics.cancelActiveSessionsForUser = async function (
  userId
) {
  const result = await this.updateMany(
    {
      userId,
      status: { $in: ["pending", "payment_intent_created"] },
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { status: "cancelled" },
    }
  );
  return result.modifiedCount;
};

// ==================== VIRTUALS ====================
checkoutSessionSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiresAt;
});

checkoutSessionSchema.virtual("timeRemaining").get(function () {
  const remaining = this.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
});

checkoutSessionSchema.virtual("minutesRemaining").get(function () {
  return Math.floor(this.timeRemaining / 60000);
});

const CheckoutSession = mongoose.model(
  "CheckoutSession",
  checkoutSessionSchema
);

module.exports = CheckoutSession;
