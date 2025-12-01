const mongoose = require("mongoose");
const checkoutItemSchema = require("./checkoutItem.schema");

/**
 * Seller Group Schema
 *
 * PURPOSE: Group checkout items by seller with pricing breakdown
 * NOTE: Each seller group represents one order to be created
 */

const sellerGroupSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: String,
    sellerEmail: String,
    items: [checkoutItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    stripeFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerReceives: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

module.exports = sellerGroupSchema;
