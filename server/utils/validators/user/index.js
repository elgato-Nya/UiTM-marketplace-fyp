// Barrel export for all user-related validators
const UserValidator = require("./user.validator");
const AddressValidator = require("./address.validator");
const MerchantValidator = require("./merchant.validator");

module.exports = {
  // === CLASS EXPORTS ===
  UserValidator,
  AddressValidator,
  MerchantValidator,

  // === USER VALIDATORS ===
  isValidUiTMEmail: UserValidator.isValidUiTMEmail,
  isValidPassword: UserValidator.isValidPassword,
  isValidUsername: UserValidator.isValidUsername,
  isValidPhoneNumber: UserValidator.isValidPhoneNumber,
  isValidMongoId: UserValidator.isValidMongoId,
  isValidAvatar: UserValidator.isValidAvatar,
  isValidRole: UserValidator.isValidRole,
  isValidRoleArray: UserValidator.isValidRoleArray,
  isValidCampus: UserValidator.isValidCampus,
  isValidFaculty: UserValidator.isValidFaculty,
  isValidBio: UserValidator.isValidBio,
  userErrorMessages: UserValidator.userErrorMessages,
  getErrorMessages: UserValidator.userErrorMessages, // Alias for tests

  // === ADDRESS VALIDATORS ===
  isValidName: AddressValidator.isValidName,
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
  isValidPostcode: AddressValidator.isValidPostcode,
  addressErrorMessages: AddressValidator.addressErrorMessages,
  validateAddressByType: AddressValidator.validateAddressByType,

  // === MERCHANT VALIDATORS ===
  isValidShopName: MerchantValidator.isValidShopName,
  isValidShopSlug: MerchantValidator.isValidShopSlug,
  isValidShopDescription: MerchantValidator.isValidShopDescription,
  isValidBusinessRegistration: MerchantValidator.isValidBusinessRegistration,
  isValidTaxId: MerchantValidator.isValidTaxId,
  isValidShopCategories: MerchantValidator.isValidShopCategories,
  isValidShopStatus: MerchantValidator.isValidShopStatus,
  isValidVerificationStatus: MerchantValidator.isValidVerificationStatus,
  isValidImageUrl: MerchantValidator.isValidImageUrl,
  merchantErrorMessages: MerchantValidator.merchantErrorMessages,
  generateSlugFromName: MerchantValidator.generateSlugFromName,
  sanitizeShopName: MerchantValidator.sanitizeShopName,
};
