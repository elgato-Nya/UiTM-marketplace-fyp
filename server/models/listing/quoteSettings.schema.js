const mongoose = require("mongoose");

const {
  ListingValidator,
  listingErrorMessages,
} = require("../../validators/listing/listing.validator");
const {
  QuoteLimits,
  QuoteFieldType,
} = require("../../utils/enums/listing.enum");

const { isValidQuoteCustomField } = ListingValidator;

/**
 * Quote Custom Field Schema (Subdocument)
 *
 * PURPOSE: Define structure for custom fields in quote requests
 * USAGE: Embedded in QuoteSettingsSchema.customFields array
 */
const QuoteCustomFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [
        true,
        listingErrorMessages.quoteSettings.customFields.field.label.required,
      ],
      trim: true,
      maxlength: [
        QuoteLimits.MAX_FIELD_LABEL_LENGTH,
        listingErrorMessages.quoteSettings.customFields.field.label.invalid,
      ],
    },

    type: {
      type: String,
      required: [
        true,
        listingErrorMessages.quoteSettings.customFields.field.type.required,
      ],
      enum: {
        values: Object.values(QuoteFieldType),
        message:
          listingErrorMessages.quoteSettings.customFields.field.type.invalid,
      },
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [String],
      validate: {
        validator: function (options) {
          // Options only required for select type
          if (this.type === QuoteFieldType.SELECT) {
            return (
              Array.isArray(options) &&
              options.length > 0 &&
              options.length <= QuoteLimits.MAX_FIELD_OPTIONS
            );
          }
          return true;
        },
        message:
          listingErrorMessages.quoteSettings.customFields.field.options.invalid,
      },
      default: [],
    },
  },
  { _id: false }
);

/**
 * Quote Settings Schema (Subdocument)
 *
 * PURPOSE: Define quote system configuration for service listings
 * PATTERN: Follows subdocument pattern for embedded configuration
 * USAGE: Embedded in Listing model as quoteSettings field
 *
 * RESTRICTION: Only applicable to service listings (type === "service")
 */
const QuoteSettingsSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    autoAccept: {
      type: Boolean,
      default: false,
    },

    minPrice: {
      type: Number,
      min: [0, listingErrorMessages.quoteSettings.minPrice.invalid],
    },

    maxPrice: {
      type: Number,
      min: [0, listingErrorMessages.quoteSettings.maxPrice.invalid],
      validate: {
        validator: function (maxPrice) {
          // maxPrice must be >= minPrice if both are set
          if (this.minPrice !== undefined && maxPrice !== undefined) {
            return maxPrice >= this.minPrice;
          }
          return true;
        },
        message: listingErrorMessages.quoteSettings.maxPrice.lessThanMin,
      },
    },

    responseTime: {
      type: String,
      trim: true,
      maxlength: [
        QuoteLimits.MAX_RESPONSE_TIME_LENGTH,
        listingErrorMessages.quoteSettings.responseTime.invalid,
      ],
    },

    requiresDeposit: {
      type: Boolean,
      default: false,
    },

    depositPercentage: {
      type: Number,
      min: [
        QuoteLimits.MIN_DEPOSIT_PERCENTAGE,
        listingErrorMessages.quoteSettings.depositPercentage.invalid,
      ],
      max: [
        QuoteLimits.MAX_DEPOSIT_PERCENTAGE,
        listingErrorMessages.quoteSettings.depositPercentage.invalid,
      ],
      default: 0,
    },

    customFields: {
      type: [QuoteCustomFieldSchema],
      validate: {
        validator: function (fields) {
          return !fields || fields.length <= QuoteLimits.MAX_CUSTOM_FIELDS;
        },
        message: listingErrorMessages.quoteSettings.customFields.limitReached,
      },
      default: [],
    },
  },
  {
    _id: false, // No separate _id for quote settings
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if quote system is fully configured
QuoteSettingsSchema.virtual("isConfigured").get(function () {
  return this.enabled === true;
});

// Virtual for checking if deposit is required and configured
QuoteSettingsSchema.virtual("hasDeposit").get(function () {
  return this.requiresDeposit && this.depositPercentage > 0;
});

module.exports = { QuoteSettingsSchema, QuoteCustomFieldSchema };
