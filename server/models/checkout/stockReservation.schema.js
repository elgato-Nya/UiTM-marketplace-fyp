const mongoose = require("mongoose");

/**
 * Stock Reservation Schema
 *
 * PURPOSE: Track virtual stock reservations during checkout
 * NOTE: Virtual reservation - actual stock deduction happens on order creation
 */
const stockReservationSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

module.exports = stockReservationSchema;
