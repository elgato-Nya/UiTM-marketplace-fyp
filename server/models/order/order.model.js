const mongoose = require("mongoose");

const orderItemSchema = require("./orderItem.schema");
const buyerInfoSchema = require("./buyerInfo.schema");
const sellerInfoSchema = require("./sellerInfo.schema");
const deliveryAddressSchema = require("./deliveryAddress.schema");
const { createForbiddenError } = require("../../utils/errors");
const {
  OrderValidator,
  orderErrorMessages,
} = require("../../validators/order/order.validator");
const {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  DeliveryMethod,
} = require("../../utils/enums/order.enum");
const logger = require("../../utils/logger");

const { isValidOrderNumber, isValidTotalAmounts, isValidStatusTransition } =
  OrderValidator;

const orderSchema = new mongoose.Schema(
  {
    // ! Auto generated: ORD-YYYYMMDD-XXXXX
    orderNumber: {
      type: String,
      unique: [true, orderErrorMessages.orderNumber.unique],
      // Not required - auto-generated in pre-save hook
      validate: [isValidOrderNumber, orderErrorMessages.orderNumber.invalid],
    },
    buyer: {
      type: buyerInfoSchema,
      required: [true, orderErrorMessages.buyer.required],
    },

    seller: {
      type: sellerInfoSchema,
      required: [true, orderErrorMessages.seller.required],
    },

    items: {
      type: [orderItemSchema],
      required: [true, orderErrorMessages.items.required],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: orderErrorMessages.items.empty,
      },
    },

    // cumulative price amounts
    itemsTotal: {
      type: Number,
      required: [true, orderErrorMessages.itemsTotal.required],
      min: [0, orderErrorMessages.itemsTotal.negative],
    },
    shippingFee: {
      type: Number,
      required: [true, orderErrorMessages.shippingFee.required],
      min: [0, orderErrorMessages.shippingFee.negative],
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, orderErrorMessages.discount.negative],
      validate: {
        validator: function (value) {
          return value <= this.itemsTotal + this.shippingFee;
        },
        message: orderErrorMessages.discount.exceedsTotal,
      },
    },
    totalAmount: {
      type: Number,
      required: [true, orderErrorMessages.amounts.required],
      min: [0, orderErrorMessages.amounts.negative],
      validate: {
        validator: function (value) {
          return isValidTotalAmounts(
            this.itemsTotal,
            this.shippingFee,
            this.totalDiscount,
            value
          );
        },
        message: orderErrorMessages.amounts.calculationError,
      },
    },

    paymentMethod: {
      type: String,
      required: [true, orderErrorMessages.paymentMethod.required],
      enum: {
        values: Object.values(PaymentMethod),
        message: orderErrorMessages.paymentMethod.invalid,
      },
    },

    paymentStatus: {
      type: String,
      required: [true, orderErrorMessages.paymentStatus.required],
      enum: {
        values: Object.values(PaymentStatus),
        message: orderErrorMessages.paymentStatus.invalid,
      },
      default: "pending",
    },

    paymentDetails: {
      stripePaymentIntentId: String,
      transactionId: String,
      paidAt: Date,
      codConfirmedAt: Date, // For COD payments
      codConfirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: "pending",
      index: true,
    },

    statusHistory: [
      {
        status: String,
        note: String,
        trackingInfo: {
          carrier: String,
          trackingNumber: String,
          trackingUrl: String,
        },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    deliveryMethod: {
      type: String,
      enum: {
        values: Object.values(DeliveryMethod),
        message: orderErrorMessages.deliveryMethod.invalid,
      },
      required: [true, orderErrorMessages.deliveryMethod.required],
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, orderErrorMessages.deliveryAddress.required],
    },

    notes: {
      buyer: {
        type: String,
        minlength: [0, orderErrorMessages.notes.invalid],
        maxlength: [250, orderErrorMessages.notes.invalid],
      },
      seller: {
        type: String,
        minLength: [0, orderErrorMessages.notes.invalid],
        maxlength: [250, orderErrorMessages.notes.invalid],
      },
    },

    // Timestamps for different actions
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for performance
orderSchema.index({ "buyer.userId": 1, status: 1, createdAt: -1 });
orderSchema.index({ "seller.userId": 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

/**
 * Generates a unique order number in the format ORD-YYYYMMDD-XXXXXX.
 * - ORD: fixed prefix
 * - YYYYMMDD: current date
 * - XXXXXX: random alphanumeric string
 * Honestly, there's an extremely small chance of duplicate order numbers, maybe im gonna ad
 */
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${dateStr}-${randomStr}`;
  }
  next();
});

/**
 * Check if a user can modify the order
 * @param {ObjectId} userId
 * @param {Array<String>} userRole
 * @returns
 */
orderSchema.methods.canUserModify = function (userId, userRole) {
  const isBuyer = this.buyer.userId.toString() === userId.toString();
  const isSeller = this.seller.userId.toString() === userId.toString();
  const isAdmin = userRole && userRole.includes("admin");
  return isAdmin || isSeller || isBuyer;
};

/**
 * PURPOSE: Check if a user can view the order
 * @param  {ObjectId} userId
 * @param {Array<String>} userRole - user role ("consumer", "merchant", "admin")
 * @returns
 */
orderSchema.methods.canUserView = function (userId, userRole) {
  const isBuyer = this.buyer.userId.toString() === userId.toString();
  const isSeller = this.seller.userId.toString() === userId.toString();
  const isAdmin = userRole && userRole.includes("admin");

  return isBuyer || isSeller || isAdmin;
};

// Method to get user perspective
orderSchema.methods.getUserPerspective = function (userId) {
  const isBuyer = this.buyer.userId.toString() === userId.toString();
  const isSeller = this.seller.userId.toString() === userId.toString();

  if (isBuyer) return "buyer";
  if (isSeller) return "seller";
  return "admin"; // For admin users
};

// Method to update status with history
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy) {
  // Validate status transition
  if (!isValidStatusTransition(this.status, newStatus)) {
    logger.error("Invalid status transition attempted:", {
      currentStatus: this.status,
      attemptedStatus: newStatus,
      updatedBy: updatedBy,
    });
    return createForbiddenError(
      `Invalid status transition from ${this.status} to ${newStatus}`,
      "INVALID_ORDER_STATUS"
    );
  }

  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedAt: new Date(),
    note,
    updatedBy,
  });

  // Update specific timestamp fields
  switch (newStatus) {
    case "confirmed":
      this.confirmedAt = new Date();
      break;
    case "shipped":
      this.shippedAt = new Date();
      break;
    case "delivered":
      this.deliveredAt = new Date();
      break;
    case "completed":
      this.completedAt = new Date();
      break;
    case "cancelled":
      this.cancelledAt = new Date();
      break;
  }
};

// Virtual for order age
orderSchema.virtual("orderAge").get(function () {
  return Date.now() - this.createdAt;
});

// Virtual to check if user can cancel
orderSchema.virtual("canCancel").get(function () {
  return ["pending", "confirmed"].includes(this.status);
});

module.exports = mongoose.model("Order", orderSchema);
