const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
const logger = require("../../utils/logger");
const {
  isValidUiTMEmail,
  isValidPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidRoleArray,
  isValidCampus,
  isValidFaculty,
  isValidBio,
  userErrorMessages,
} = require("../../utils/validators/user");

const errorMessages = userErrorMessages();

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidUiTMEmail,
        message: errorMessages.email,
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      trim: true,
      validate: {
        validator: isValidPassword,
        message: errorMessages.password,
      },
    },

    // ======================   Personal Profile Information   ========================
    profile: {
      avatar: {
        type: String,
      },
      username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exists"],
        trim: true,
        validate: {
          validator: isValidUsername,
          message: errorMessages.username,
        },
      },
      bio: {
        type: String,
        trim: true,
        validate: {
          validator: isValidBio,
          message: errorMessages.bio,
        },
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        unique: [true, "Phone number already exists"],
        trim: true,
        validate: {
          validator: isValidPhoneNumber,
          message: errorMessages.phoneNumber,
        },
      },
      campus: {
        type: String,
        required: [true, "Campus is required"],
        enum: {
          values: Object.values(CampusEnum),
          message: errorMessages.campus,
        },
        validate: {
          validator: isValidCampus,
          message: errorMessages.campus,
        },
      },
      faculty: {
        type: String,
        required: [true, "Faculty is required"],
        enum: {
          // ! this doesnt mean that the object values will be saved in database
          // ! it just means that the values will be accepted from frontend and validated
          // ! it will be converted to object key before saving using pre-save middleware
          values: Object.values(FacultyEnum),
          message: errorMessages.faculty,
        },
        validate: {
          validator: isValidFaculty,
          message: errorMessages.faculty,
        },
      },
    },

    // ======================   Address References   ========================
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    role: {
      type: [String],
      required: [true, "Role is required"],
      enum: {
        values: ["consumer", "merchant", "admin"],
        message: errorMessages.role,
      },
      default: ["consumer"],
      validate: {
        validator: isValidRoleArray,
        message: errorMessages.roleArray,
      },
      index: true,
    },

    // ======================   Merchant Details   ========================
    merchantDetails: {
      shopName: {
        type: String,
        unique: [true, "Shop name already exists"],
        sparse: true, // Allow multiple null values for non-merchants
        trim: true,
        required: function () {
          return this.role.includes("merchant");
        },
        minlength: [3, "Shop name must be at least 3 characters long"],
        maxlength: [50, "Shop name cannot exceed 50 characters"],
      },
      shopSlug: {
        type: String,
        unique: true,
        sparse: true, // if not set to true, null values are considered duplicate
        lowercase: true,
        match: [
          /^[a-z0-9-]+$/,
          "Shop slug can only contain lowercase letters, numbers, and hyphens",
        ],
      },
      shopDescription: {
        type: String,
        trim: true,
        maxlength: [200, "Shop description cannot exceed 200 characters"],
      },
      shopLogo: {
        type: String,
        trim: true,
      },
      shopBanner: {
        type: String,
        trim: true,
      },
    },

    lastActive: {
      type: Date,
      default: () => Date.now(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.password; // don't return password in JSON
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.password; // don't return password in Object
        return ret;
      },
    },
  }
);

// ======================   Indexes   ========================
UserSchema.index({ email: 1, isActive: 1 }, { unique: true });
// UserSchema.index({ "profile.username": 1 }, { unique: true }); // Removed: unique field already creates index
UserSchema.index({ role: 1, isActive: 1 });

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
  // Convert faculty value to key if it's a display value
  if (Object.values(FacultyEnum).includes(this.profile.faculty)) {
    this.profile.faculty = Object.keys(FacultyEnum).find(
      (key) => FacultyEnum[key] === this.profile.faculty
    );
  }
  // Convert campus value to key if it's a display value
  if (Object.values(CampusEnum).includes(this.profile.campus)) {
    this.profile.campus = Object.keys(CampusEnum).find(
      (key) => CampusEnum[key] === this.profile.campus
    );
  }
  next();
});

// ======================   Instance Methods   ========================
UserSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

UserSchema.methods.updateLastActive = function () {
  setImmediate(async () => {
    try {
      await User.findByIdAndUpdate(this._id, { lastActive: new Date() });
    } catch (error) {
      logger.warn("Failed to update last active", { userId: this._id });
    }
  });
};

// ======================   JWT related methods   ========================
UserSchema.methods.getAccessToken = function () {
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
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

  this.refreshTokens.push(refreshToken);
  await this.save({ validateBeforeSave: false });
  return refreshToken;
};

// ======================   Static Methods   ========================
UserSchema.statics.findByCredentials = async function (email, password) {
  try {
    const user = await this.findOne({ email: email.toLowerCase() }).select(
      "+password +refreshTokens"
    );

    if (!user) {
      logger.warn("Login attempt with non-existing email", {
        email: email.toLowerCase(),
      });
      return null;
    }

    if (await user.comparePassword(password)) {
      return user;
    }
    return null;
  } catch (error) {
    logger.errorWithStack(error, {
      action: "find_by_credentials",
      email: email.toLowerCase(),
    });
    throw error;
  }
};

// ======================   Address Management Methods   ========================
UserSchema.methods.addAddress = async function (addressData) {
  const Address = mongoose.model("Address");

  // Add userId to address data
  const newAddress = new Address({
    ...addressData,
    userId: this._id,
  });

  const savedAddress = await newAddress.save();

  // Add address reference to user
  this.addresses.push(savedAddress._id);
  await this.save({ validateBeforeSave: false });

  return savedAddress;
};

UserSchema.methods.getAddresses = async function () {
  await this.populate("addresses");
  return this.addresses;
};

UserSchema.methods.removeAddress = async function (addressId) {
  const Address = mongoose.model("Address");

  // Remove address document
  await Address.findByIdAndDelete(addressId);

  // Remove address reference from user
  this.addresses = this.addresses.filter((id) => !id.equals(addressId));
  await this.save({ validateBeforeSave: false });

  return true;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
