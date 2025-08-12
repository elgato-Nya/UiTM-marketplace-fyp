// Barrel export for all validators
const UserValidator = require("./user.validator");

module.exports = {
  // Export the class
  UserValidator,

  // Export individual static methods for convenience
  isValidUiTMEmail: UserValidator.isValidUiTMEmail,
  isValidPassword: UserValidator.isValidPassword,
  isValidUsername: UserValidator.isValidUsername,
  isValidPhoneNumber: UserValidator.isValidPhoneNumber,
  isValidMongoId: UserValidator.isValidMongoId,
  isValidAvatar: UserValidator.isValidAvatar,
  isValidRoleArray: UserValidator.isValidRoleArray,
  isValidRole: UserValidator.isValidRole,
  isValidCampus: UserValidator.isValidCampus,
  isValidFaculty: UserValidator.isValidFaculty,
  isValidBio: UserValidator.isValidBio,
  getErrorMessages: UserValidator.getErrorMessages,
};
