const mongoose = require("mongoose");

const {
  AddressValidator,
  addressErrorMessages,
  UserValidator,
} = require("../../validators/user");
const { CampusEnum, StateEnum } = require("../../utils/enums/user.enum");
const { AddressType } = require("../../utils/enums/order.enum");

const { isValidPhoneNumber } = UserValidator;
const {
  isValidAddressLine1,
  isValidAddressLine2,
  isValidCampusBuilding,
  isValidCampusFloor,
  isValidCampusRoom,
  isValidCity,
  isValidRecipientName,
  isValidPostcode,
} = AddressValidator;

// Helper function to set required fields based on address type
function isCampusRequired() {
  return this.type === "campus";
}

function isPersonalRequired() {
  return this.type === "personal";
}

const AddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      minlength: [2, addressErrorMessages.label.invalid],
      maxlength: [50, addressErrorMessages.label.invalid],
    },
    type: {
      type: String,
      required: [true, addressErrorMessages.type.required],
      trim: true,
      enum: {
        values: Object.values(AddressType),
        message: addressErrorMessages.type.invalid,
      },
    },
    recipientName: {
      type: String,
      required: [true, addressErrorMessages.recipientName.required],
      trim: true,
      validate: {
        validator: isValidRecipientName,
        message: addressErrorMessages.recipientName.invalid,
      },
    },
    recipientPhone: {
      type: String,
      required: [true, addressErrorMessages.recipientPhone.required],
      trim: true,
      validate: {
        validator: isValidPhoneNumber,
        message: addressErrorMessages.recipientPhone.invalid,
      },
    },

    campusAddress: {
      campus: {
        type: String,
        required: [isCampusRequired, addressErrorMessages.campus.required],
        trim: true,
        enum: {
          values: Object.keys(CampusEnum),
          message: addressErrorMessages.campus.invalid,
        },
      },
      building: {
        type: String,
        required: [isCampusRequired, addressErrorMessages.building.required],
        trim: true,
        validate: {
          validator: isValidCampusBuilding,
          message: addressErrorMessages.building.invalid,
        },
      },
      floor: {
        type: String,
        required: [isCampusRequired, addressErrorMessages.floor.required],
        trim: true,
        validate: {
          validator: isValidCampusFloor,
          message: addressErrorMessages.floor.invalid,
        },
      },
      room: {
        type: String,
        required: [isCampusRequired, addressErrorMessages.room.required],
        trim: true,
        validate: {
          validator: isValidCampusRoom,
          message: addressErrorMessages.room.invalid,
        },
      },
    },

    personalAddress: {
      addressLine1: {
        type: String,
        required: [
          isPersonalRequired,
          addressErrorMessages.addressLine1.required,
        ],
        trim: true,
        validate: {
          validator: isValidAddressLine1,
          message: addressErrorMessages.addressLine1.invalid,
        },
      },
      addressLine2: {
        type: String,
        required: false,
        trim: true,
        validate: {
          validator: isValidAddressLine2,
          message: addressErrorMessages.addressLine2.invalid,
        },
      },
      city: {
        type: String,
        required: [isPersonalRequired, addressErrorMessages.city.required],
        trim: true,
        validate: {
          validator: isValidCity,
          message: addressErrorMessages.city.invalid,
        },
      },
      state: {
        type: String,
        required: [isPersonalRequired, addressErrorMessages.state.required],
        trim: true,
        enum: {
          values: Object.keys(StateEnum),
          message: addressErrorMessages.state.invalid,
        },
      },
      postcode: {
        type: String,
        required: [isPersonalRequired, addressErrorMessages.postcode.required],
        trim: true,
        validate: {
          validator: isValidPostcode,
          message: addressErrorMessages.postcode.invalid,
        },
      },
    },

    // Pickup/Meetup Point Details
    pickupDetails: {
      location: {
        type: String,
        required: [
          function () {
            return this.type === "pickup";
          },
          addressErrorMessages.pickupLocation.required,
        ],
        trim: true,
        validate: {
          validator: function (value) {
            if (this.type !== "pickup") return true;
            return AddressValidator.isValidPickupLocation(value);
          },
          message: addressErrorMessages.pickupLocation.invalid,
        },
      },
      pickupTime: {
        type: Date,
        required: [
          function () {
            return this.type === "pickup";
          },
          addressErrorMessages.pickupTime.required,
        ],
        validate: {
          validator: function (value) {
            if (this.type !== "pickup") return true;
            return AddressValidator.isValidPickupTime(value);
          },
          message: addressErrorMessages.pickupTime.invalid,
        },
      },
    },

    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [250, addressErrorMessages.specialInstructions.maxLength],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true, // keep this for explicitness, addresses will have their own _id
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

  // Validate that pickup addresses have pickupDetails
  if (
    this.type === "pickup" &&
    (!this.pickupDetails || !this.pickupDetails.location)
  ) {
    const error = new Error(
      "Pickup details are required for pickup type addresses"
    );
    error.name = "ValidationError";
    return next(error);
  }

  // Campus enum conversion is now handled in the service layer
  // for better separation of concerns and easier testing
  next();
});

// ======================   Virtuals   ========================

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
  } else if (this.type === "pickup" && this.pickupDetails) {
    const { location, pickupTime } = this.pickupDetails;
    const formattedTime = pickupTime
      ? new Date(pickupTime).toLocaleString("en-MY", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

    return `${location}${formattedTime ? ` (${formattedTime})` : ""}`;
  }
  return "";
});

module.exports = AddressSchema;
