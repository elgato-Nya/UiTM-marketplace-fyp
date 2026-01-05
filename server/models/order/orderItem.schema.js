const mongoose = require("mongoose");

const {
  UserValidator,
  userErrorMessages,
  ListingValidator,
  listingErrorMessages,
  orderErrorMessages,
} = require("../../validators");

const { isValidMongoId } = UserValidator;
const { isValidImagesArray, isValidListingName, isValidListingDescription } =
  ListingValidator;
const orderItemSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, orderErrorMessages.requiredId.listing],
      validate: [isValidMongoId, userErrorMessages.mongoId.invalid.listing],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Snapshot of variant details at time of order for historical accuracy
    variantSnapshot: {
      name: { type: String, default: null },
      sku: { type: String, default: null },
      price: { type: Number, default: null },
      attributes: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    name: {
      type: String,
      required: [true, listingErrorMessages.name.required],
      trim: true,
      validate: [isValidListingName, listingErrorMessages.name.invalid.format],
    },
    description: {
      type: String,
      trim: true,
      validate: [
        isValidListingDescription,
        listingErrorMessages.description.invalid,
      ],
    },
    price: {
      type: Number,
      required: [true, listingErrorMessages.price.required],
      min: [0, listingErrorMessages.price.invalid],
    },
    quantity: {
      type: Number,
      required: [true, orderErrorMessages.quantity.required],
      min: [1, orderErrorMessages.quantity.invalid],
    },
    images: {
      type: [String],
      trim: true,
      validate: [
        isValidImagesArray,
        listingErrorMessages.images.invalid.format,
      ],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, orderErrorMessages.discount.negative],
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: orderErrorMessages.discount.exceedsPrice,
      },
    },
    type: {
      type: String,
      enum: ["product", "service"],
      default: "product",
      // Snapshot of listing type at time of order (for stock management)
    },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual to check if order item has a variant
orderItemSchema.virtual("hasVariant").get(function () {
  return this.variantId != null;
});

// Virtual to get effective price (variant price if applicable)
orderItemSchema.virtual("effectivePrice").get(function () {
  if (this.variantSnapshot?.price != null) {
    return this.variantSnapshot.price;
  }
  return this.price;
});

// Virtual to get display name with variant
orderItemSchema.virtual("displayName").get(function () {
  if (this.variantSnapshot?.name) {
    return `${this.name} - ${this.variantSnapshot.name}`;
  }
  return this.name;
});

module.exports = orderItemSchema;
