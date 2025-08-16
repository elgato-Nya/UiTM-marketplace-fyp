const { isValidCampus, isValidPhoneNumber } = require("./user.validator");
const { StateEnum } = require("../../enums/user.enum");

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
    if (
      !address ||
      typeof address !== "object" ||
      address.type !== "personal" ||
      !AddressValidator.isValidAddressType(address.type)
    ) {
      return false;
    }

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
    if (addressLine1.length > 150) return false;

    return true;
  }

  static isValidAddressLine2(addressLine2) {
    if (!addressLine2) return true;
    if (addressLine2 && typeof addressLine2 !== "string") return false;
    if (addressLine2 && addressLine2.length > 150) return false;

    return true;
  }

  /**
   * Validates a city name.
   *
   * The city name must be a non-empty string, up to 50 characters long,
   * and may only contain alphabetic characters, spaces, apostrophes, or hyphens.
   * Numbers and special characters other than space, apostrophe, and hyphen are not allowed.
   *
   * @param {string} city - The city name to validate.
   * @returns {boolean} True if the city name is valid, false otherwise.
   */
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
      (address.type === "campus" &&
        !AddressValidator.isValidCampusAddress(address)) ||
      (address.type === "personal" &&
        !AddressValidator.isValidPersonalAddress(address)) ||
      !AddressValidator.isValidName(address.recipientName) ||
      !isValidPhoneNumber(address.phoneNumber)
    ) {
      return false;
    }

    return true;
  }

  static addressErrorMessages() {
    return {
      type: "Address type must be one of 'campus', 'personal'",
      recipientName:
        "Recipient name is required, contains only alphabet, '@', '/' and must be between 4 to 100 characters",
      phoneNumber: "Phone number is required (e.g., 01234567890)",
      campus: "Campus is required and must be a valid enum value",
      campusAddress: "Campus address is required if type is 'campus'",
      building:
        "Building name is required and must be a string not exceeding 100 characters",
      floor:
        "Floor is required and must be a string not exceeding 25 characters",
      room: "Room is required and must be a string not exceeding 25 characters",
      personalAddress: "Personal address is required if type is 'personal'",
      addressLine1:
        "Address line 1 is required and must be a string not exceeding 150 characters",
      addressLine2:
        "Address line 2 is optional but must be a string not exceeding 150 characters",
      city: "City is required and must be a valid string (max 50 characters, alphabetic only)",
      state: "State is required and must be a valid enum value",
      postcode: "Postcode is required and must be a 5-digit string",
    };
  }
}

module.exports = AddressValidator;
