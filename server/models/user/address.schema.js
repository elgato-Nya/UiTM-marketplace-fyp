const mongoose = require("mongoose");
const {
  isValidAddressLine1,
  isValidAddressLine2,
  isValidCampus,
  isValidCampusBuilding,
  isValidCampusFloor,
  isValidCampusRoom,
  isValidCity,
  isValidName,
  isValidPhoneNumber,
  isValidPostcode,
  isValidState,
  addressErrorMessages,
} = require("../../utils/validators/user");
const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
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
        message: errorMessages.recipientName,
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: isValidPhoneNumber,
        message: errorMessages.phoneNumber,
      },
    },

    campusAddress: {
      campus: {
        type: String,
        required: [
          function () {
            return this.type === "campus";
          },
          "Campus is required for campus address",
        ],
        enum: {
          values: Object.values(CampusEnum),
          message: errorMessages.campus,
        },
        trim: true,
        validate: {
          validator: isValidCampus,
          message: errorMessages.campus,
        },
      },
      building: {
        type: String,
        required: [
          function () {
            return this.type === "campus";
          },
          "Building name is required for campus address",
        ],
        trim: true,
        validate: {
          validator: isValidCampusBuilding,
          message: errorMessages.building,
        },
      },
      floor: {
        type: String,
        required: [
          function () {
            return this.type === "campus";
          },
          "Floor number is required for campus address",
        ],
        trim: true,
        validate: {
          validator: isValidCampusFloor,
          message: errorMessages.floor,
        },
      },
      room: {
        type: String,
        required: [
          function () {
            return this.type === "campus";
          },
          "Room number is required for campus address",
        ],
        trim: true,
        validate: {
          validator: isValidCampusRoom,
          message: errorMessages.room,
        },
      },
    },

    personalAddress: {
      addressLine1: {
        type: String,
        required: [
          function () {
            return this.type === "personal";
          },
          "Address line 1 is required for personal address",
        ],
        trim: true,
        validate: {
          validator: isValidAddressLine1,
          message: errorMessages.addressLine1,
        },
      },
      addressLine2: {
        type: String,
        trim: true,
        validate: {
          validator: isValidAddressLine2,
          message: errorMessages.addressLine2,
        },
      },
      city: {
        type: String,
        required: [
          function () {
            return this.type === "personal";
          },
          "City is required for personal address",
        ],
        trim: true,
        validate: {
          validator: isValidCity,
          message: errorMessages.city,
        },
      },
      state: {
        type: String,
        required: [
          function () {
            return this.type === "personal";
          },
          "State is required for personal address",
        ],
        trim: true,
        validate: {
          validator: isValidState,
          message: errorMessages.state,
        },
      },
      postcode: {
        type: String,
        required: [
          function () {
            return this.type === "personal";
          },
          "Postcode is required for personal address",
        ],
        trim: true,
        validate: {
          validator: isValidPostcode,
          message: errorMessages.postcode,
        },
      },
    },

    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
      validate: {
        validator: (v) => mongoose.isValidObjectId(v),
        message: "Invalid User ID",
      },
    },
  },
  {
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
AddressSchema.index({ userId: 1, type: 1 }, { unique: true });

// =======================   Pre-save Hooks   ========================
AddressSchema.pre("save", function (next) {
  if (Object.values(CampusEnum).includes(this.campusAddress.campus)) {
    this.campusAddress.campus = Object.keys(CampusEnum).find(
      (key) => CampusEnum[key] === this.campusAddress.campus
    );
  }
  next();
});

// ? Ensure only one default address per user (if needed in future)
// AddressSchema.pre("save", async function(next) {
//   if (this.isDefault && this.isModified("isDefault")) {
//        Remove default flag from other addresses
//     await this.constructor.updateMany(
//       { userId: this.userId, _id: { $ne: this._id } },
//       { isDefault: false }
//     );
//   }
//   next();
// });

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

module.exports = mongoose.model("Address", AddressSchema);
