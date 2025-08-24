const { UserValidator } = require("./user.validator");
const { StateEnum } = require("../../enums/user.enum");

const { isValidCampus, isValidPhoneNumber } = UserValidator;

class AddressValidator {
  static isValidAddressType(type) {
    const AddressTypeEnum = Object.freeze({
      CAMPUS: "campus",
      PERSONAL: "personal",
      // ? consider add "temporary" address type in the future
    });
    return (
      typeof type === "string" && Object.values(AddressTypeEnum).includes(type)
    );
  }

  static isValidCampusBuilding(building) {
    if (!building || typeof building !== "string") return false;
    if (building.trim().length === 0) return false; // Reject empty/whitespace strings
    if (building.trim().length < 2) return false; // Minimum 2 characters for building names
    if (building.length > 100) return false;
    return true;
  }

  static isValidCampusFloor(floor) {
    if (!floor || typeof floor !== "string") return false;
    if (floor.length > 25) return false;
    return true;
  }

  static isValidCampusRoom(room) {
    if (!room || typeof room !== "string") return false;
    if (room.length > 25) return false;
    return true;
  }

  static isValidCampusAddress(address) {
    if (
      !address ||
      typeof address !== "object" ||
      address.type !== "campus" ||
      !AddressValidator.isValidAddressType(address.type)
    ) {
      return false;
    }

    const { campusAddress } = address;
    if (
      !campusAddress ||
      typeof campusAddress !== "object" ||
      !isValidCampus(campusAddress.campus) ||
      !AddressValidator.isValidCampusBuilding(campusAddress.building) ||
      !AddressValidator.isValidCampusFloor(campusAddress.floor) ||
      !AddressValidator.isValidCampusRoom(campusAddress.room)
    ) {
      return false;
    }

    return true;
  }

  static isValidPersonalAddress(address) {
    const { personalAddress } = address;
    if (
      !personalAddress ||
      typeof personalAddress !== "object" ||
      !AddressValidator.isValidAddressLine1(personalAddress.addressLine1) ||
      !AddressValidator.isValidAddressLine2(personalAddress.addressLine2) ||
      !AddressValidator.isValidCity(personalAddress.city) ||
      !AddressValidator.isValidState(personalAddress.state) ||
      !AddressValidator.isValidPostcode(personalAddress.postcode)
    ) {
      return false;
    }

    return true;
  }

  static isValidAddressLine1(addressLine1) {
    if (!addressLine1 || typeof addressLine1 !== "string") return false;
    if (addressLine1.trim().length === 0) return false; // Reject empty/whitespace strings
    if (addressLine1.length > 150) return false;

    return true;
  }

  static isValidAddressLine2(addressLine2) {
    if (!addressLine2) return true;
    if (addressLine2 && typeof addressLine2 !== "string") return false;
    if (addressLine2 && addressLine2.length > 150) return false;

    return true;
  }

  static isValidCity(city) {
    if (!city || typeof city !== "string") return false;
    if (city.length > 50) return false;

    return /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(city);
  }

  static isValidState(state) {
    if (!state || typeof state !== "string") return false;

    return Object.values(StateEnum).includes(state);
  }

  static isValidPostcode(postcode) {
    if (!postcode || typeof postcode !== "string") return false;
    if (postcode.length !== 5) return false;

    return /^\d{5}$/.test(postcode);
  }

  static isValidName(name) {
    if (!name || typeof name !== "string") return false;
    // Accepts only alphabet (lower/uppercase), only one "@" symbol, and only one "/" symbol, and max length 100
    if ((name.match(/@/g) || []).length > 1) return false;
    if ((name.match(/\//g) || []).length > 1) return false;
    return /^[A-Za-z@\/ ]{4,100}$/.test(name);
  }

  static isValidAddress(address) {
    if (!address || typeof address !== "object") return false;

    if (
      !AddressValidator.isValidAddressType(address.type) ||
      !AddressValidator.isValidName(address.recipientName) ||
      !isValidPhoneNumber(address.phoneNumber) ||
      (address.type === "campus" &&
        !AddressValidator.isValidCampusAddress(address)) ||
      (address.type === "personal" &&
        !AddressValidator.isValidPersonalAddress(address))
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Centralized error messages for address validation
 */
const addressErrorMessages = () => ({
  type: {
    required: "Address type is required",
    invalid: "Address type must be one of 'campus', 'personal'",
  },
  recipientName: {
    required: "Recipient name is required",
    invalid:
      "Recipient name contains only alphabet, '@', '/' and must be between 4 to 100 characters",
  },
  phoneNumber: {
    required: "Phone number is required",
    invalid: "Phone number is required (e.g., 01234567890)",
  },
  campus: {
    required: "Campus is required for campus addresses",
    invalid: "Campus must be a valid enum value",
  },
  campusAddress: {
    required: "Campus address is required if type is 'campus'",
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
  personalAddress: {
    required: "Personal address is required if type is 'personal'",
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
  address: {
    invalid: "Address is invalid",
  },
});

module.exports = {
  AddressValidator,
  addressErrorMessages,
};
