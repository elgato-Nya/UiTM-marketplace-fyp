const mongoose = require("mongoose");

/**
 * Pricing Summary Schema
 *
 * PURPOSE: Overall pricing breakdown for entire checkout session
 * NOTE: Aggregates all seller groups' pricing
 */

const pricingSummarySchema = new mongoose.Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDeliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPlatformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStripeFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

module.exports = pricingSummarySchema;
