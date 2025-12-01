const mongoose = require("mongoose");

const {
  UserValidator,
  userErrorMessages,
  AddressValidator,
  addressErrorMessages,
  orderErrorMessages,
} = require("../../validators");
const { isValidUiTMEmail, isValidPhoneNumber } = UserValidator;
const { isValidRecipientName } = AddressValidator;

const sellerInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, orderErrorMessages.requiredId.seller],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, addressErrorMessages.recipientName.required],
      // !! Contains seller display name (username for users, shop name for merchants)
      // !! and use recipient name validation since it support both for now
      validate: [
        isValidRecipientName,
        addressErrorMessages.recipientName.invalid,
      ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, userErrorMessages.email.required],
      validate: [isValidUiTMEmail, userErrorMessages.email.invalid],
    },
    phone: {
      type: String,
      trim: true,
      validate: [
        isValidPhoneNumber,
        userErrorMessages.phoneNumber.invalid.format,
      ],
    },
  },
  { _id: false }
);

module.exports = sellerInfoSchema;
