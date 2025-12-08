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

/**
 * Validate seller display name (can be username or shop name)
 * Accepts:
 * - Usernames: 6-16 chars, letters, numbers, underscores, hyphens
 * - Shop names: 3-50 chars, letters, numbers, spaces, hyphens, apostrophes, ampersands, periods
 */
const isValidSellerDisplayName = (name) => {
  if (!name || typeof name !== "string") return false;

  const trimmedName = name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 50) return false;

  // Allow letters, numbers, spaces, hyphens, underscores, apostrophes, ampersands, and periods
  // This covers both username and shop name formats
  const sellerNameRegex = /^[a-zA-Z0-9\s\-_'&.]+$/;
  if (!sellerNameRegex.test(trimmedName)) return false;

  // Must start and end with alphanumeric
  if (!/^[a-zA-Z0-9]/.test(trimmedName) || !/[a-zA-Z0-9]$/.test(trimmedName))
    return false;

  return true;
};

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
      required: [true, "Seller name is required"],
      // Contains seller display name (username for users, shop name for merchants)
      validate: [
        isValidSellerDisplayName,
        "Seller name must be 3-50 characters and contain only letters, numbers, spaces, hyphens, underscores, apostrophes, ampersands, and periods",
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
