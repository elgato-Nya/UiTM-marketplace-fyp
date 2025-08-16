// Barrel export for all validators
const UserValidator = require("./user.validator");
const AddressValidator = require("./address.validator");

module.exports = {
  // Export the class
  UserValidator,
  isValidUiTMEmail: UserValidator.isValidUiTMEmail,
  isValidPassword: UserValidator.isValidPassword,
  isValidUsername: UserValidator.isValidUsername,
  isValidPhoneNumber: UserValidator.isValidPhoneNumber,
  isValidMongoId: UserValidator.isValidMongoId,
  isValidAvatar: UserValidator.isValidAvatar,
  isValidRoleArray: UserValidator.isValidRoleArray,
  isValidCampus: UserValidator.isValidCampus,
  isValidFaculty: UserValidator.isValidFaculty,
  isValidBio: UserValidator.isValidBio,
  userErrorMessages: UserValidator.userErrorMessages,
  AddressValidator,
  isValidAddressType: AddressValidator.isValidAddressType,
  isValidCampusAddress: AddressValidator.isValidCampusAddress,
  isValidCampusBuilding: AddressValidator.isValidCampusBuilding,
  isValidCampusFloor: AddressValidator.isValidCampusFloor,
  isValidCampusRoom: AddressValidator.isValidCampusRoom,
  isValidPersonalAddress: AddressValidator.isValidPersonalAddress,
  isValidAddressLine1: AddressValidator.isValidAddressLine1,
  isValidAddressLine2: AddressValidator.isValidAddressLine2,
  isValidCity: AddressValidator.isValidCity,
  isValidState: AddressValidator.isValidState,
};
