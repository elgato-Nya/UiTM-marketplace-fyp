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
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, cartErrorMessages.quantity.required],
      validate: [
        CartValidator.isValidQuantity,
        cartErrorMessages.quantity.invalid,
      ],
    },
    // Snapshot of variant details at time of adding to cart
    // for display purposes when variant may change
    variantSnapshot: {
      name: { type: String, default: null },
      sku: { type: String, default: null },
      price: { type: Number, default: null },
      attributes: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    timestamps: false, // manually handled by addedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove old listingId field if it exists
        delete ret.listingId;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
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

// Virtuals for variant support
CartItemSchema.virtual("hasVariant").get(function () {
  return this.variantId != null;
});

// Get display price (variant price if applicable, otherwise listing price)
CartItemSchema.virtual("displayPrice").get(function () {
  if (this.variantSnapshot?.price != null) {
    return this.variantSnapshot.price;
  }
  // Fall back to listing price when populated
  if (this.listing?.price != null) {
    return this.listing.price;
  }
  return null;
});

// Get display name (variant name if applicable)
CartItemSchema.virtual("displayName").get(function () {
  if (this.variantSnapshot?.name) {
    const listingName = this.listing?.name || "";
    return `${listingName} - ${this.variantSnapshot.name}`;
  }
  return this.listing?.name || null;
});

module.exports = CartItemSchema;
