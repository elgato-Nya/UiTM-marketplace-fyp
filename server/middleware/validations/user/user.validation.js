const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const {
  UserValidator,
  userErrorMessages,
} = require("../../../validators/user");

const {
  // isValidUiTMEmail, // ? for simplicity, i wont allow for user to update email
  // isValidCampus,  // ? same goes for campus
  // isValidFaculty, // ? and faculty, yet
  isValidPassword, // TODO: allow user to update password
  isValidUsername,
  isValidAvatar,
  isValidPhoneNumber,
  isValidBio,
} = UserValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================
const avatarValidation = (fieldName = "profile.avatar") => {
  return body(fieldName)
    .optional()
    .trim()
    .custom((avatar) => {
      if (avatar) {
        return isValidAvatar(avatar);
      }
    })
    .withMessage(userErrorMessages.avatar.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================
const validateUpdateProfile = [
  // Make all fields optional for updates (unlike registration)
  body("profile.username")
    .optional()
    .trim()
    .isLength({ min: 4, max: 15 })
    .custom((username) => {
      if (username) {
        return isValidUsername(username);
      }
      return true;
    })
    .withMessage(userErrorMessages.username.invalid),

  avatarValidation("profile.avatar"),

  body("profile.bio")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .custom((bio) => {
      if (bio) {
        return isValidBio(bio);
      }
      return true; // Allow empty bio
    })
    .withMessage(userErrorMessages.bio.invalid),

  body("profile.phoneNumber")
    .optional()
    .trim()
    .custom((phoneNumber) => {
      if (phoneNumber) {
        return isValidPhoneNumber(phoneNumber);
      }
      return true;
    })
    .withMessage(userErrorMessages.phoneNumber.invalid),

  // Security: Prevent updating campus/faculty/roles in regular profile updates
  body("profile.campus").not().exists().withMessage("Campus cannot be updated"),
  body("profile.faculty")
    .not()
    .exists()
    .withMessage("Faculty cannot be updated"),
  body("roles").not().exists().withMessage("Roles cannot be updated"),

  // Security: Prevent forbidden fields
  body("password")
    .not()
    .exists()
    .withMessage("Password updates not allowed here"),
  body("email").not().exists().withMessage("Email updates not allowed here"),
  body("_id").not().exists().withMessage("ID cannot be updated"),

  handleValidationErrors,
];

module.exports = {
  validateUpdateProfile,
  validateUpdateMe: validateUpdateProfile, // Alias for routes
  avatarValidation,
};
