import * as yup from "yup";

import { CAMPUS_OPTIONS } from "../constants/authConstant";
import { STATE_OPTIONS } from "../constants/addressConstant";

const errorMessages = {
  type: {
    required: "Address type is required",
    invalid: "Address type must be one of 'campus', 'personal'",
  },
  recipientName: {
    required: "Recipient name is required",
    invalid:
      "Recipient name must be between 4 to 100 characters and contain only letters, '@' and '/' symbols",
  },
  recipientPhone: {
    required: "Phone number is required",
    invalid: "Phone number must start with 0 and be 10 or 11 digits long",
  },
  campusAddress: {
    required: "Campus address is required if type is 'campus'",
  },
  campus: {
    required: "Campus is required for campus addresses",
    invalid: "Campus must be a valid enum value",
  },
  building: {
    required: "Building name is required for campus addresses",
    invalid: "Building name must be a string not exceeding 100 characters",
  },
  floor: {
    required: "Floor is required for campus addresses",
    invalid: "Floor must be a string not exceeding 25 characters",
  },
  room: {
    required: "Room is required for campus addresses",
    invalid: "Room must be a string not exceeding 25 characters",
  },
  addressLine1: {
    required: "Address line 1 is required",
    invalid: "Address line 1 must be a string not exceeding 150 characters",
  },
  addressLine2: {
    invalid: "Address line 2 must be a string not exceeding 150 characters",
  },
  city: {
    required: "City is required",
    invalid: "City must be a valid string (max 50 characters, alphabetic only)",
  },
  state: {
    required: "State is required",
    invalid: "State must be a valid enum value",
  },
  postcode: {
    required: "Postcode is required",
    invalid: "Postcode must be a 5-digit string",
  },
  specialInstructions: {
    maxLength: "Special instructions cannot exceed 250 characters",
  },
  isDefault: {
    required: "isDefault must be a boolean value",
  },
  pickupLocation: {
    required: "Pickup location is required",
    invalid: "Pickup location must be between 5 to 200 characters",
  },
  pickupTime: {
    required: "Pickup time is required",
    invalid: "Pickup time must be a valid future date and time",
  },
};

const sharedValidation = {
  recipientName: yup
    .string()
    .required(errorMessages.recipientName.required)
    .test(
      "is-valid-recipient-name",
      errorMessages.recipientName.invalid,
      function (value) {
        if (!value || typeof value !== "string") return false;
        const trimmedName = value.trim();
        if ((trimmedName.match(/@/g) || []).length > 1) return false;
        if ((trimmedName.match(/\//g) || []).length > 1) return false;
        return /^[A-Za-z@\/ ]{4,100}$/.test(trimmedName);
      }
    ),
  recipientPhone: yup
    .string()
    .required(errorMessages.recipientPhone.required)
    .matches(/^0\d{9,10}$/, errorMessages.recipientPhone.invalid),
  specialInstructions: yup
    .string()
    .max(250, errorMessages.specialInstructions.maxLength)
    .nullable(),
  isDefault: yup.boolean().required(errorMessages.isDefault.required),
};

export const campusAddressValidation = yup.object({
  type: yup
    .string()
    .required(errorMessages.type.required)
    .oneOf(["campus"], errorMessages.type.invalid),
  ...sharedValidation,
  campusAddress: yup
    .object({
      campus: yup
        .string()
        .required(errorMessages.campus.required)
        .oneOf(
          CAMPUS_OPTIONS.map((s) => s.value),
          errorMessages.campus.invalid
        ),
      building: yup
        .string()
        .required(errorMessages.building.required)
        .min(2, errorMessages.building.invalid)
        .max(100, errorMessages.building.invalid),
      floor: yup
        .string()
        .required(errorMessages.floor.required)
        .max(25, errorMessages.floor.invalid),
      room: yup
        .string()
        .required(errorMessages.room.required)
        .max(25, errorMessages.room.invalid),
    })
    .required(errorMessages.campusAddress.required),
});

export const personalAddressValidation = yup.object({
  type: yup
    .string()
    .required(errorMessages.type.required)
    .oneOf(["personal"], errorMessages.type.invalid),
  ...sharedValidation,
  personalAddress: yup.object({
    addressLine1: yup
      .string()
      .required(errorMessages.addressLine1.required)
      .max(150, errorMessages.addressLine1.invalid),
    addressLine2: yup.string().max(150, errorMessages.addressLine2.invalid),
    city: yup
      .string()
      .required(errorMessages.city.required)
      .max(100, errorMessages.city.invalid),
    state: yup
      .string()
      .required(errorMessages.state.required)
      .oneOf(
        STATE_OPTIONS.map((s) => s.value),
        errorMessages.state.invalid
      ),
    postcode: yup
      .string()
      .required(errorMessages.postcode.required)
      .matches(/^\d{5}$/, errorMessages.postcode.invalid),
  }),
});

// Pickup Address Validation Schema
export const pickupAddressValidation = yup.object({
  type: yup.string().oneOf(["pickup"]).required(),
  ...sharedValidation,
  pickupDetails: yup.object({
    location: yup
      .string()
      .required(errorMessages.pickupLocation.required)
      .min(5, errorMessages.pickupLocation.invalid)
      .max(200, errorMessages.pickupLocation.invalid),
    pickupTime: yup
      .date()
      .required(errorMessages.pickupTime.required)
      .min(new Date(), errorMessages.pickupTime.invalid)
      .typeError(errorMessages.pickupTime.invalid),
  }),
});
