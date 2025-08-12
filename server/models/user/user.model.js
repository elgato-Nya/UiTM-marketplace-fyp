const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
const logger = require("../../utils/logger");

// Destructure for cleaner code
const {
  isValidUiTMEmail,
  isValidPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidRoleArray,
  isValidCampus,
  isValidFaculty,
  isValidBio,
  getErrorMessages,
} = require("../../utils/validators");

const errorMessages = getErrorMessages();

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
          values: Object.keys(CampusEnum),
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
          values: Object.keys(FacultyEnum),
          message: errorMessages.faculty,
        },
        validate: {
          validator: isValidFaculty,
          message: errorMessages.faculty,
        },
      },
    },

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
  }
);

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

module.exports = mongoose.model("User", UserSchema);
