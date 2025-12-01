const mongoose = require("mongoose");

const {
  AddressValidator,
  addressErrorMessages,
  UserValidator,
  userErrorMessages,
} = require("../../validators");
const { AddressType } = require("../../utils/enums/order.enum");

const {
  isValidRecipientName,
  isValidCampusDetails,
  isValidPersonalDetails,
  isValidPickupDetails,
} = AddressValidator;
const { isValidPhoneNumber } = UserValidator;

const deliveryAddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: Object.values(AddressType),
        message: addressErrorMessages.type.invalid,
      },
    },
    recipientName: {
      type: String,
      trim: true,
      required: [true, addressErrorMessages.recipientName.required],
      validate: [
        isValidRecipientName,
        addressErrorMessages.recipientName.invalid,
      ],
    },
    recipientPhone: {
      type: String,
      trim: true,
      required: [true, userErrorMessages.phoneNumber.required],
      validate: [
        isValidPhoneNumber,
        userErrorMessages.phoneNumber.invalid.format,
      ],
    },

    campusAddress: {
      type: {
        campus: String,
        building: String,
        floor: String,
        room: String,
      },
      validate: {
        validator: function (value) {
          if (this.type !== "campus") return true;
          return isValidCampusDetails(value);
        },
        message: addressErrorMessages.campusAddress.invalid,
      },
    },

    personalAddress: {
      type: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        postcode: String,
      },
      validate: {
        validator: function (value) {
          if (this.type !== "personal") return true;
          return isValidPersonalDetails(value);
        },
        message: addressErrorMessages.personalAddress.invalid,
      },
    },

    pickupDetails: {
      type: {
        location: String,
        pickupTime: Date,
      },
      validate: {
        validator: function (value) {
          if (this.type !== "pickup") return true;
          return isValidPickupDetails(value);
        },
        message: addressErrorMessages.pickupDetails.invalid,
      },
    },
  },
  { _id: false }
);

module.exports = deliveryAddressSchema;
