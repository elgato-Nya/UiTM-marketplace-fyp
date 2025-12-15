const { UserValidator } = require("./user.validator");
const { StateEnum } = require("../../utils/enums/user.enum");

const { isValidCampus, isValidPhoneNumber } = UserValidator;
const { AddressType } = require("../../utils/enums/order.enum");

class AddressValidator {
  static isValidLabel(label) {
    if (!label) return true; // Optional field
    if (typeof label !== "string") return false;
    if (label.trim().length < 2) return false;
    if (label.trim().length > 50) return false;
    return true;
  }

  static isValidAddressType(type) {
    if (typeof type !== "string") return false;

    const validTypes = [
      ...Object.keys(AddressType),
      ...Object.values(AddressType),
    ];
    return validTypes.includes(type);
  }

  static isValidRecipientName(recipientName) {
    if (!recipientName || typeof recipientName !== "string") return false;
    const trimmedName = recipientName.trim();
    // Accepts alphanumeric (lower/uppercase), numbers, only one "@" symbol, and only one "/" symbol, and max length 100
    if ((trimmedName.match(/@/g) || []).length > 1) return false;
    if ((trimmedName.match(/\//g) || []).length > 1) return false;
    return /^[A-Za-z0-9@\/ ]{4,100}$/.test(trimmedName);
  }

  static isValidCampusAddress(address) {
    if (!address || typeof address !== "object") {
      return false;
    }

    const { campusAddress } = address;
    return AddressValidator.isValidCampusDetails(campusAddress);
  }

  static isValidCampusDetails(campusAddress) {
    if (!campusAddress || typeof campusAddress !== "object") return false;
    if (!isValidCampus(campusAddress.campus)) return false;
    if (!AddressValidator.isValidCampusBuilding(campusAddress.building))
      return false;
    if (!AddressValidator.isValidCampusFloor(campusAddress.floor)) return false;
    if (!AddressValidator.isValidCampusRoom(campusAddress.room)) return false;
    return true;
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

  static isValidPersonalAddress(address) {
    if (!address || typeof address !== "object") return false;

    const { personalAddress } = address;
    return AddressValidator.isValidPersonalDetails(personalAddress);
  }

  static isValidPersonalDetails(personalAddress) {
    if (!personalAddress || typeof personalAddress !== "object") return false;
    if (!AddressValidator.isValidAddressLine1(personalAddress.addressLine1))
      return false;
    if (!AddressValidator.isValidAddressLine2(personalAddress.addressLine2))
      return false;
    if (!AddressValidator.isValidCity(personalAddress.city)) return false;
    if (!AddressValidator.isValidState(personalAddress.state)) return false;
    if (!AddressValidator.isValidPostcode(personalAddress.postcode))
      return false;
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

    const validValues = [
      ...Object.values(StateEnum),
      ...Object.keys(StateEnum),
    ];
    return validValues.includes(state);
  }

  static isValidPostcode(postcode) {
    if (!postcode || typeof postcode !== "string") return false;
    if (postcode.length !== 5) return false;

    return /^\d{5}$/.test(postcode);
  }

  static isValidPickupDetails(pickupDetails) {
    if (!pickupDetails || typeof pickupDetails !== "object") return false;

    const { location, pickupTime } = pickupDetails;

    return (
      AddressValidator.isValidPickupLocation(location) &&
      AddressValidator.isValidPickupTime(pickupTime)
    );
  }

  static isValidPickupLocation(location) {
    if (!location || typeof location !== "string") return false;
    if (location.trim().length < 5) return false;
    if (location.length > 200) return false;
    return true;
  }

  static isValidSpecialInstructions(instructions) {
    if (!instructions) return true;
    if (instructions && typeof instructions !== "string") return false;
    if (instructions && instructions.length > 250) return false;
    return true;
  }

  static isValidPickupTime(time) {
    if (!time) return false;
    const date = new Date(time);
    if (isNaN(date.getTime())) return false;

    // Allow dates up to 1 minute in the past to account for timing differences and network latency
    const oneMinuteAgo = new Date(Date.now() - 60000);
    if (date < oneMinuteAgo) return false;

    return true;
  }

  static isValidAddress(address) {
    if (!address || typeof address !== "object") return false;

    if (
      !AddressValidator.isValidAddressType(address.type) ||
      !AddressValidator.isValidRecipientName(address.recipientName) ||
      !isValidPhoneNumber(address.recipientPhone)
    ) {
      return false;
    }

    switch (address.type) {
      case "campus":
        if (!AddressValidator.isValidCampusAddress(address)) return false;
        break;
      case "personal":
        if (!AddressValidator.isValidPersonalAddress(address)) return false;
        break;
      case "pickup":
        // No further validation for pickup type
        break;
      default:
        return false;
    }

    return true;
  }
}

/**
 * Centralized error messages for address validation
 */
const addressErrorMessages = {
  label: {
    invalid: "Label must be a string between 2 to 50 characters",
  },
  type: {
    required: "Address type is required",
    invalid: "Address type must be one of 'campus', 'personal'",
  },
  recipientName: {
    required: "Recipient name is required",
    invalid:
      "Recipient name contains only alphabet, '@', '/' and must be between 4 to 100 characters",
  },
  recipientPhone: {
    required: "Phone number is required",
    invalid: "Phone number is required (e.g., 01234567890)",
  },
  campusAddress: {
    required: "Campus address is required if type is 'campus'",
    invalid: "Campus address is invalid",
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
  personalAddress: {
    required: "Personal address is required if type is 'personal'",
    invalid: "Personal address is invalid",
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
  pickupDetails: {
    required: "Pickup details are required for pickup type addresses",
    invalid: "Pickup details are invalid",
  },
  pickupLocation: {
    required: "Pickup location is required in pickup details",
    invalid: "Pickup location must be a string between 5 to 200 characters",
  },
  specialInstructions: {
    invalid:
      "Special instructions must be a string not exceeding 250 characters",
  },
  pickupTime: {
    required: "Pickup time is required in pickup details",
    invalid:
      "Pickup time must be a valid date and not more than a minute in the past",
  },
  address: {
    invalid: "Address is invalid",
    required: "Address is required",
  },
  addressId: {
    required: "Address ID is required",
    invalid: "Address ID must be a valid MongoDB ObjectId",
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
  isDefault: {
    required: "isDefault must be a boolean value",
  },
};

module.exports = {
  AddressValidator,
  addressErrorMessages,
};
