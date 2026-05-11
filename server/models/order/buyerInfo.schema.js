const mongoose = require("mongoose");

const {
  UserValidator,
  userErrorMessages,
  orderErrorMessages,
} = require("../../validators");
const { isValidEmail, isValidPhoneNumber, isValidUsername } = UserValidator;

const buyerInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, orderErrorMessages.requiredId.buyer],
      index: true,
    },
    // ! Snapshot at time of order for historical accuracy and legal reasons
    username: {
      type: String,
      trim: true,
      required: [true, userErrorMessages.username.required],
      validate: [isValidUsername, userErrorMessages.username.invalid.format],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, userErrorMessages.email.required],
      validate: [isValidEmail, userErrorMessages.email.invalid],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, userErrorMessages.phoneNumber.required],
      validate: [
        isValidPhoneNumber,
        userErrorMessages.phoneNumber.invalid.format,
      ],
    },
  },
  { _id: false }
);

module.exports = buyerInfoSchema;
