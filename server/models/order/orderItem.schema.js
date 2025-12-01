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
  },
  { _id: false }
);

module.exports = orderItemSchema;
