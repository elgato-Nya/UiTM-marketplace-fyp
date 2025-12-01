const mongoose = require("mongoose");

/**
 * Checkout Item Schema
 *
 * PURPOSE: Item snapshot for checkout session
 * NOTE: Captures listing details at checkout time
 */

const checkoutItemSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["product", "service"],
      required: true,
    },
    stock: {
      type: Number,
      min: 0,
    },
    images: [String],
    // Seller info for grouping
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: String,
    // Item total
    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

module.exports = checkoutItemSchema;
