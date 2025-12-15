// TODO: hash refresh token before saving to db?
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
const logger = require("../../utils/logger");
const merchantSchema = require("./merchant.schema");
const addressSchema = require("./address.schema");
const { UserValidator, userErrorMessages } = require("../../validators/user");
const { createServerError } = require("../../utils/errors");

const {
  isValidEmail,
  isValidUiTMEmail,
  isValidPassword,
  isValidAvatar,
  isValidUsername,
  isValidPhoneNumber,
  isValidBio,
} = UserValidator;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, userErrorMessages.email.required],
      unique: [true, userErrorMessages.email.unique],
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail, // ✅ CHANGED: Now accepts any email domain
        message: userErrorMessages.email.invalid,
      },
      index: true,
      select: false, // ⚠️ PRIVACY: Hide from public queries
    },
    password: {
      type: String,
      required: [true, userErrorMessages.password.required],
      select: false,
      trim: true,
      validate: {
        validator: function (password) {
          // Skip validation if password is already hashed (bcrypt hash pattern)
          if (/^\$2[aby]\$/.test(password)) {
            return true;
          }
          // Otherwise validate as plain password
          return isValidPassword(password);
        },
        message: userErrorMessages.password.invalid.format,
      },
    },

    // ======================   Personal Profile Information   ========================
    profile: {
      avatar: {
        type: String,
        trim: true,
        validate: [isValidAvatar, userErrorMessages.avatar.invalid],
      },
      username: {
        type: String,
        required: [true, userErrorMessages.username.required],
        unique: [true, userErrorMessages.username.unique],
        trim: true,
        validate: {
          validator: isValidUsername,
          message: userErrorMessages.username.invalid,
        },
      },
      bio: {
        type: String,
        trim: true,
        validate: {
          validator: isValidBio,
          message: userErrorMessages.bio.invalid,
        },
        default: "",
      },
      phoneNumber: {
        type: String,
        required: [true, userErrorMessages.phoneNumber.required],
        unique: [true, userErrorMessages.phoneNumber.unique],
        trim: true,
        validate: {
          validator: isValidPhoneNumber,
          message: userErrorMessages.phoneNumber.invalid,
        },
      },
      campus: {
        type: String,
        required: [true, userErrorMessages.campus.required],
        trim: true,
        enum: {
          values: Object.keys(CampusEnum), // Standardized to use keys
          message: userErrorMessages.campus.invalid,
        },
      },
      faculty: {
        type: String,
        required: [true, userErrorMessages.faculty.required],
        trim: true,
        enum: {
          values: Object.keys(FacultyEnum), // Already using keys
          message: userErrorMessages.faculty.invalid,
        },
      },
    },

    // ======================   Address References   ========================
    addresses: [addressSchema],

    roles: {
      type: [String],
      enum: {
        values: ["consumer", "merchant", "admin"],
        message: userErrorMessages.roles.invalid,
      },
      default: ["consumer"],
      index: true,
    },

    // ======================   Admin Level (Phase 2)   ========================
    // TODO: recheck whether to place this directly under user role or what
    // For role-based access control within admin role
    // super: Full access including financial data
    // moderator: Content moderation, user management (no financial data)
    adminLevel: {
      type: String,
      enum: {
        values: ["super", "moderator"],
        message: "Admin level must be either super or moderator",
      },
      // Only set if user has 'admin' role
      required: function () {
        return this.roles && this.roles.includes("admin");
      },
      // Only admins should have this field
      validate: {
        validator: function (value) {
          if (value && !this.roles.includes("admin")) {
            return false; // Can't have adminLevel without admin role
          }
          return true;
        },
        message: "Only admin users can have an admin level",
      },
    },

    // ======================   Merchant Details   ========================
    merchantDetails: merchantSchema,

    // ======================   Activity Tracking & Security   ========================
    lastActive: { type: Date, default: () => Date.now() },
    lastActivityAt: { type: Date, default: () => Date.now() },
    isActive: { type: Boolean, default: true },
    // TODO: consider hashing refresh tokens, and any other tokens before saving to db
    refreshTokens: { type: [String], default: [], select: false },

    // ======================   Suspension Management   ========================
    isSuspended: { type: Boolean, default: false, index: true },
    suspendedAt: { type: Date },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    suspensionReason: { type: String, trim: true },
    requirePasswordChange: { type: Boolean, default: false },

    emailVerification: {
      isVerified: { type: Boolean, default: false },
      token: { type: String, select: false },
      tokenExpires: { type: Date, select: false },
      verifiedAt: { type: Date, select: false },
    },
    // TODO: implement count and rate limiting logic
    passwordReset: {
      token: { type: String, select: false },
      tokenExpires: { type: Date, select: false },
      requestedAt: { type: Date, select: false },
      lastResetAt: { type: Date, select: false },
      resetCount: { type: Number, default: 0, select: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.password; // don't return password in JSON
        delete ret.refreshTokens; // don't return refresh tokens in JSON
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.password; // don't return password in Object
        delete ret.refreshTokens; // don't return refresh tokens in Object
        return ret;
      },
    },
  }
);

// ======================   Indexes   ========================
UserSchema.index({ roles: 1, isActive: 1 });

// ======================   Pre-save Middleware   ========================
UserSchema.pre("save", async function (next) {
  // exit if password hashed to prevent hashing if password is not modified
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre("save", function (next) {
  // Handle default address logic for subdocuments
  if (this.isModified("addresses")) {
    // Group addresses by type for default checking
    const addressesByType = {};

    this.addresses.forEach((address, index) => {
      if (!addressesByType[address.type]) {
        addressesByType[address.type] = [];
      }
      addressesByType[address.type].push({ address, index });
    });

    // For each address type, ensure only one default exists
    Object.keys(addressesByType).forEach((type) => {
      const addressesOfType = addressesByType[type];
      const defaultAddresses = addressesOfType.filter(
        (item) => item.address.isDefault
      );

      if (defaultAddresses.length > 1) {
        // If multiple defaults exist, keep only the last one as default
        defaultAddresses.slice(0, -1).forEach((item) => {
          this.addresses[item.index].isDefault = false;
        });
      } else if (
        defaultAddresses.length === 0 &&
        addressesOfType.length === 1
      ) {
        // If no default exists but only one address of this type, make it default
        this.addresses[addressesOfType[0].index].isDefault = true;
      }
    });
  }

  next();
});

// Pre-save hook: Track username changes
UserSchema.pre("save", function (next) {
  if (this.isModified("profile.username")) {
    this._usernameChanged = true;
    this._oldUsername = this._original?.profile?.username;
  }
  next();
});

// Post-save hook: Sync username changes to listings (safety net for direct DB operations)
UserSchema.post("save", async function (doc) {
  // Check if username was modified and user is a merchant with a shop
  if (
    doc._usernameChanged &&
    doc.roles.includes("merchant") &&
    doc.merchantDetails?.shopName
  ) {
    try {
      const Listing = require("../listing/listing.model");

      // Sync all merchant data, not just username
      const updateData = {
        "seller.username": doc.profile.username,
        "seller.shopName": doc.merchantDetails.shopName,
        "seller.shopSlug": doc.merchantDetails.shopSlug,
        "seller.isVerifiedMerchant": doc.merchantDetails.isVerified || false,
      };

      const result = await Listing.updateMany(
        { "seller.userId": doc._id },
        { $set: updateData }
      );

      logger.info(
        `[Model Hook] Synced merchant data to ${result.modifiedCount} listings for user: ${doc._id}`
      );
    } catch (error) {
      logger.error(
        `[Model Hook] Failed to sync merchant data to listings:`,
        error
      );
      // Don't block the save operation
    }
  }
});

// ======================   Instance Methods   ========================
UserSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// ======================   Address Management Methods   ========================
UserSchema.methods.setDefaultAddress = function (addressId, addressType) {
  // Remove default flag from all addresses of the same type
  this.addresses.forEach((address) => {
    if (
      address.type === addressType &&
      address._id.toString() !== addressId.toString()
    ) {
      address.isDefault = false;
    }
  });

  // Set the specified address as default
  const targetAddress = this.addresses.id(addressId);
  if (targetAddress && targetAddress.type === addressType) {
    targetAddress.isDefault = true;
    return true;
  }
  return false;
};

UserSchema.methods.addAddress = function (addressData) {
  // If this is the first address of its type, make it default
  const existingAddressesOfType = this.addresses.filter(
    (addr) => addr.type === addressData.type
  );

  if (existingAddressesOfType.length === 0) {
    addressData.isDefault = true;
  } else if (addressData.isDefault) {
    // If new address is set as default, remove default from others of same type
    existingAddressesOfType.forEach((address) => {
      address.isDefault = false;
    });
  }

  this.addresses.push(addressData);
  return this.addresses[this.addresses.length - 1];
};

UserSchema.methods.updateAddress = function (addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) return null;

  const originalType = address.type;

  // Update the address
  Object.keys(updateData).forEach((key) => {
    address[key] = updateData[key];
  });

  // Handle default logic if isDefault is being updated
  if (updateData.hasOwnProperty("isDefault") && updateData.isDefault) {
    // Remove default flag from other addresses of the same type
    this.addresses.forEach((addr) => {
      if (
        addr.type === address.type &&
        addr._id.toString() !== addressId.toString()
      ) {
        addr.isDefault = false;
      }
    });
  }

  return address;
};

UserSchema.methods.removeAddress = function (addressId) {
  const address = this.addresses.id(addressId);
  if (!address) return false;

  const addressType = address.type;
  const wasDefault = address.isDefault;

  // Remove the address using pull
  this.addresses.pull(addressId);

  // If the removed address was default, set another address of the same type as default
  if (wasDefault) {
    const remainingAddressesOfType = this.addresses.filter(
      (addr) => addr.type === addressType
    );
    if (remainingAddressesOfType.length > 0) {
      remainingAddressesOfType[0].isDefault = true;
    }
  }

  return true;
};

// ======================   JWT related methods   ========================
UserSchema.methods.getAccessToken = function () {
  const payload = {
    userId: this._id,
    email: this.email,
    roles: this.roles,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || "30m",
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });
};

UserSchema.methods.getRefreshToken = async function () {
  const payload = {
    userId: this._id,
    tokenType: "refresh",
  };

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });

  try {
    // Atomically push and trim refreshTokens array
    await this.constructor.findByIdAndUpdate(
      this._id,
      {
        $push: {
          refreshTokens: {
            $each: [refreshToken],
            $slice: -5, // keep only last 5 tokens
          },
        },
      },
      { validateBeforeSave: false }
    );
    return refreshToken;
  } catch (error) {
    logger.error("Failed to save refresh token", {
      action: "generate_refresh_token",
      error: error.message,
      userId: this._id,
    });
    createServerError(
      "Failed to generate refresh token",
      "REFRESH_TOKEN_ERROR"
    );
  }
};

// ======================   Static Methods   ========================
UserSchema.statics.findByCredentials = async function (email, password) {
  const DUMMY_HASH =
    "$2b$12$KIXQJQw1rQbYpQJwQJwQJ.QJwQJwQJwQJwQJwQJwQJwQJwQJwQJw";
  try {
    const user = await this.findOne({ email: email.toLowerCase() }).select(
      "+email +password +refreshTokens +emailVerification.isVerified"
    );
    // Always perform password comparison to mitigate timing attacks
    const isValidPassword = user
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!user) {
      logger.security("Login attempt with non-existing email", {
        action: "find_user_by_credential",
        email: email.toLowerCase(),
      });
    }

    return user && isValidPassword ? user : null;
  } catch (error) {
    logger.error(error, {
      action: "find_by_credentials",
      email: email.toLowerCase(),
    });
    createServerError("Failed to find user by credentials", "USER_MODEL_ERROR");
  }
};
// ======================   Virtuals   ========================

// ! still unsure about this, cauase kinda feel useless
UserSchema.virtual("isVerified").get(function () {
  return this.emailVerification?.isVerified;
});

UserSchema.virtual("isMerchant").get(function () {
  return this.roles?.includes("merchant") || false;
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
