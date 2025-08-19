const { body, param, validationResult } = require("express-validator");
const logger = require("../../../utils/logger");

const {
  // isValidUiTMEmail, // ? for simplicity, i wont allow for user to update email
  // isValidCampus,  // ? same goes for campus
  // isValidFaculty, // ? and faculty, yet
  isValidPassword, // TODO: allow user to update password
  isValidUsername,
  isValidAvatar,
  isValidPhoneNumber,
  isValidBio,
  userErrorMessages,
} = require("../../../utils/validators/user");

const errorMessages = userErrorMessages();

// ================ VALIDATION ERROR MIDDLEWARE ================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    logger.error("Validation errors:", {
      formattedErrors,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      user: req.user ? { id: req.user._id, email: req.user.email } : null,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
    });
  }

  next();
};

// ================ REUSABLE VALIDATION RULE CHAINS ================
const avatarValidation = (fieldName = "avatar") => {
  return body(fieldName)
    .optional()
    .trim()
    .custom((avatar) => {
      if (!isValidAvatar(avatar)) {
        throw new Error(errorMessages.avatar.invalid);
      }
      return true;
    });
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================
const validateUpdateProfile = [
  // Make all fields optional for updates (unlike registration)
  body("profile.username")
    .optional()
    .trim()
    .isLength({ min: 6, max: 16 })
    .custom((username) => {
      if (username && !isValidUsername(username)) {
        throw new Error(errorMessages.username.invalid);
      }
      return true;
    }),

  avatarValidation(),

  body("profile.bio")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .custom((bio) => {
      if (bio && !isValidBio(bio)) {
        throw new Error(errorMessages.bio.invalid);
      }
      return true;
    }),

  body("profile.phoneNumber")
    .optional()
    .trim()
    .custom((phoneNumber) => {
      if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        throw new Error(errorMessages.phoneNumber.invalid);
      }
      return true;
    }),

  // Security: Prevent updating campus/faculty/role in regular profile updates
  body("profile.campus").not().exists().withMessage("Campus cannot be updated"),
  body("profile.faculty")
    .not()
    .exists()
    .withMessage("Faculty cannot be updated"),
  body("role").not().exists().withMessage("Role cannot be updated"),

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
