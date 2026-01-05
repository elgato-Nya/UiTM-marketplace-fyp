const mongoose = require("mongoose");

const {
  ListingValidator,
  listingErrorMessages,
} = require("../../validators/listing/listing.validator");
const { VariantLimits } = require("../../utils/enums/listing.enum");

const {
  isValidVariantName,
  isValidSku,
  isValidVariantPrice,
  isValidVariantStock,
  isValidVariantAttributes,
  isValidVariantImages,
} = ListingValidator;

/**
 * Variant Schema (Subdocument)
 *
 * PURPOSE: Define variant structure for product/service listings
 * PATTERN: Follows cartItem.schema.js subdocument pattern
 * USAGE: Embedded in Listing model as variants array
 *
 * BACKWARD COMPATIBILITY:
 * - Variants are optional - existing listings work without them
 * - Price/stock at listing level still works for legacy mode
 */
const VariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, listingErrorMessages.variant.name.required],
      trim: true,
      minlength: [
        VariantLimits.MIN_VARIANT_NAME_LENGTH,
        listingErrorMessages.variant.name.invalid,
      ],
      maxlength: [
        VariantLimits.MAX_VARIANT_NAME_LENGTH,
        listingErrorMessages.variant.name.invalid,
      ],
      validate: [isValidVariantName, listingErrorMessages.variant.name.invalid],
    },

    sku: {
      type: String,
      trim: true,
      maxlength: [
        VariantLimits.MAX_SKU_LENGTH,
        listingErrorMessages.variant.sku.invalid,
      ],
      validate: [isValidSku, listingErrorMessages.variant.sku.invalid],
      sparse: true, // Allow null/undefined for optional SKU
    },

    price: {
      type: Number,
      required: [true, listingErrorMessages.variant.price.required],
      min: [0, listingErrorMessages.variant.price.invalid],
      validate: [
        isValidVariantPrice,
        listingErrorMessages.variant.price.invalid,
      ],
    },

    stock: {
      type: Number,
      min: [0, listingErrorMessages.variant.stock.invalid],
      validate: [
        isValidVariantStock,
        listingErrorMessages.variant.stock.invalid,
      ],
      // Note: Required validation handled at parent level based on listing type
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    attributes: {
      type: mongoose.Schema.Types.Mixed, // Flexible key-value pairs
      validate: [
        isValidVariantAttributes,
        listingErrorMessages.variant.attributes.invalid,
      ],
      default: {},
    },

    images: {
      type: [String],
      validate: [
        isValidVariantImages,
        listingErrorMessages.variant.images.invalid,
      ],
      default: [],
    },
  },
  {
    _id: true, // Auto-generate _id for each variant
    timestamps: true, // createdAt, updatedAt for each variant
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure id is always present
        ret.id = ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Virtual for checking if variant is in stock (for products)
VariantSchema.virtual("inStock").get(function () {
  // If stock is undefined (service), always in stock
  if (this.stock === undefined || this.stock === null) return true;
  return this.stock > 0 && this.isAvailable;
});

// Virtual for display name with attributes
VariantSchema.virtual("displayName").get(function () {
  if (!this.attributes || Object.keys(this.attributes).length === 0) {
    return this.name;
  }
  const attrValues = Object.values(this.attributes).join(" / ");
  return `${this.name} (${attrValues})`;
});

module.exports = VariantSchema;
