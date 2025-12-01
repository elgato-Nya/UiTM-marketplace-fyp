const mongoose = require("mongoose");

const {
  CartValidator,
  cartErrorMessages,
} = require("../../validators/cart/cart.validator");
const CartItemSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, cartErrorMessages.listingId.required],
    },
    quantity: {
      type: Number,
      required: [true, cartErrorMessages.quantity.required],
      validate: [
        CartValidator.isValidQuantity,
        cartErrorMessages.quantity.invalid,
      ],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    // TODO: Add variants field for future size/color/variant options
    // variants: {
    //   size: String,
    //   color: String,
    // },
  },
  {
    _id: true,
    timestamps: false, // manually handled by addedAt
    toJSON: {
      transform: function (doc, ret) {
        // Remove old listingId field if it exists
        delete ret.listingId;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        // Remove old listingId field if it exists
        delete ret.listingId;
        return ret;
      },
    },
  }
);

CartItemSchema.pre("save", function (next) {
  if (this.isModified("quantity")) {
    this.lastUpdatedAt = Date.now();
  }
  next();
});

module.exports = CartItemSchema;
