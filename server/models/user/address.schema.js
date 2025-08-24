const mongoose = require("mongoose");
const {
  AddressValidator,
  addressErrorMessages,
  UserValidator,
} = require("../../validators/user");
const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");

const { isValidCampus, isValidPhoneNumber } = UserValidator;
const {
  isValidAddressLine1,
  isValidAddressLine2,
  isValidCampusBuilding,
  isValidCampusFloor,
  isValidCampusRoom,
  isValidCity,
  isValidName,
  isValidPostcode,
  isValidState,
} = AddressValidator;
const errorMessages = addressErrorMessages();

const AddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Address type is required"],
      enum: {
        values: ["campus", "personal"],
        message: "Address type must be one of 'campus', 'personal'",
      },
    },
    recipientName: {
      type: String,
      required: [true, "Receipant name is required"],
      trim: true,
      validate: {
        validator: isValidName,
        message:
          "Recipient name contains only alphabet, '@', '/' and must be between 4 to 100 characters",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: isValidPhoneNumber,
        message: "Phone number must start with 0 and be 10 or 11 digits long",
      },
    },

    campusAddress: {
      campus: {
        type: String,
        trim: true,
        validate: {
          validator: isValidCampus,
          message: "Campus must be a valid enum value",
        },
      },
      building: {
        type: String,
        trim: true,
        validate: {
          validator: isValidCampusBuilding,
          message:
            "Building name must be a string not exceeding 100 characters",
        },
      },
      floor: {
        type: String,
        trim: true,
        validate: {
          validator: isValidCampusFloor,
          message: "Floor must be a string not exceeding 25 characters",
        },
      },
      room: {
        type: String,
        trim: true,
        validate: {
          validator: isValidCampusRoom,
          message: "Room number is required for campus address",
        },
      },
    },

    personalAddress: {
      addressLine1: {
        type: String,
        trim: true,
        validate: {
          validator: isValidAddressLine1,
          message: "Address line 1 is required for personal address",
        },
      },
      addressLine2: {
        type: String,
        trim: true,
        validate: {
          validator: isValidAddressLine2,
          message:
            "Address line 2 must be a string not exceeding 150 characters",
        },
      },
      city: {
        type: String,
        trim: true,
        validate: {
          validator: isValidCity,
          message: "City is required for personal address",
        },
      },
      state: {
        type: String,
        trim: true,
        validate: {
          validator: isValidState,
          message: "State is required for personal address",
        },
      },
      postcode: {
        type: String,
        trim: true,
        validate: {
          validator: isValidPostcode,
          message: "Postcode is required for personal address",
        },
      },
    },

    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    },

    isDefault: {
      type: Boolean,
      default: false,
      required: [true, "Default address flag is required"],
    },
  },
  {
    _id: true, // Keep _id for embedded documents
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.__v; // don't return version key in JSON
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.__v; // don't return version key in Object
        return ret;
      },
    },
  }
);

// ======================   Indexes   ========================
// Indexes are handled at the User model level for embedded documents

// =======================   Pre-save Hooks   ========================
AddressSchema.pre("save", function (next) {
  // Validate that campus addresses have campusAddress details
  if (
    this.type === "campus" &&
    (!this.campusAddress || !this.campusAddress.campus)
  ) {
    const error = new Error(
      "Campus address details are required for campus type addresses"
    );
    error.name = "ValidationError";
    return next(error);
  }

  // Validate that personal addresses have personalAddress details
  if (
    this.type === "personal" &&
    (!this.personalAddress || !this.personalAddress.addressLine1)
  ) {
    const error = new Error(
      "Personal address details are required for personal type addresses"
    );
    error.name = "ValidationError";
    return next(error);
  }

  // Campus enum conversion is now handled in the service layer
  // for better separation of concerns and easier testing
  next();
});

AddressSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    // Remove default flag from other addresses of the same type
    await this.constructor.updateMany(
      {
        userId: this.userId,
        type: this.type,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
  }
  next();
});

AddressSchema.virtual("formattedAddress").get(function () {
  if (this.type === "campus" && this.campusAddress) {
    const { building, floor, room, campus } = this.campusAddress;

    return `${floor}${room}, ${building}, ${campus}`;
  } else if (this.type === "personal" && this.personalAddress) {
    const { addressLine1, addressLine2, city, state, postcode } =
      this.personalAddress;

    return `${addressLine1},${
      addressLine2 ? `, ${addressLine2}` : ""
    }, ${postcode}, ${city}, ${state}`;
  }
  return "";
});

module.exports = AddressSchema;
