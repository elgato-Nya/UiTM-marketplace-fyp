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

  // ✅ NEW: Validation for enhanced profile fields
  body("profile.location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must not exceed 100 characters"),

  body("profile.website")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Website URL must not exceed 200 characters")
    .custom((url) => {
      if (!url) return true;
      return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        url
      );
    })
    .withMessage("Please provide a valid website URL"),

  body("profile.socialLinks.twitter")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Twitter handle must not exceed 100 characters"),

  body("profile.socialLinks.instagram")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Instagram handle must not exceed 100 characters"),

  body("profile.socialLinks.facebook")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Facebook profile must not exceed 100 characters"),

  body("profile.socialLinks.linkedin")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("LinkedIn profile must not exceed 100 characters"),

  body("profile.yearOfStudy")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Year of study must be between 1 and 10"),

  body("profile.programOfStudy")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Program of study must not exceed 150 characters"),

  body("profile.interests")
    .optional()
    .isArray({ max: 10 })
    .withMessage("You can add up to 10 interests")
    .custom((interests) => {
      if (!interests) return true;
      return interests.every(
        (interest) => typeof interest === "string" && interest.length <= 50
      );
    })
    .withMessage("Each interest must be a string up to 50 characters long"),

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
