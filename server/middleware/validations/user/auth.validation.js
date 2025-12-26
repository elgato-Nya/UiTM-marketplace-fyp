const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const { CampusEnum, FacultyEnum } = require("../../../utils/enums/user.enum");
const {
  UserValidator,
  userErrorMessages,
} = require("../../../validators/user");

const {
  isValidEmail,
  isValidUiTMEmail,
  isValidPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidMongoId,
  isValidRoleArray,
  isValidCampus,
  isValidFaculty,
  isValidBio,
} = UserValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================

const emailValidation = (fieldName = "email") => {
  return (
    body(fieldName)
      .notEmpty()
      .withMessage(userErrorMessages.email.required)
      .bail()
      .trim()
      .toLowerCase()
      .isEmail()
      // .normalizeEmail() ← REMOVED: This removes dots from Gmail addresses!
      .custom((email) => {
        return isValidEmail(email); // ✅ CHANGED: Now accepts any email domain
      })
      .withMessage(userErrorMessages.email.invalid)
  );
};

const passwordValidation = (fieldName = "password") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(userErrorMessages.password.required)
    .bail()
    .trim()
    .isLength({ min: 8, max: 24 })
    .withMessage(userErrorMessages.password.invalid.length)
    .bail()
    .custom((password) => {
      return isValidPassword(password);
    })
    .withMessage(userErrorMessages.password.invalid.format);
};

const usernameValidation = (fieldName = "profile.username") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(userErrorMessages.username.required)
    .bail()
    .trim()
    .isLength({ min: 4, max: 15 })
    .withMessage(userErrorMessages.username.invalid.length)
    .bail()
    .custom((username) => {
      return isValidUsername(username);
    })
    .withMessage(userErrorMessages.username.invalid.format);
};

const phoneNumberValidation = (fieldName = "profile.phoneNumber") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(userErrorMessages.phoneNumber.required)
    .bail()
    .isLength({ min: 10, max: 11 })
    .withMessage(userErrorMessages.phoneNumber.invalid.length)
    .trim()
    .custom((phoneNumber) => {
      return isValidPhoneNumber(phoneNumber);
    })
    .withMessage(userErrorMessages.phoneNumber.invalid.format);
};

const bioValidation = (fieldName = "profile.bio") => {
  return body(fieldName)
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage(userErrorMessages.bio.invalid)
    .bail()
    .custom((bio) => {
      if (bio) {
        return isValidBio(bio);
      }
      return true; // Allow empty bio since it's optional
    })
    .withMessage(userErrorMessages.bio.invalid);
};

const campusValidation = (fieldName = "profile.campus") => {
  return body(fieldName)
    .optional() // ✅ CHANGED: Optional for all users
    .trim()
    .custom((campus, { req }) => {
      // If campus is provided, validate it
      if (campus) {
        if (!Object.keys(CampusEnum).includes(campus)) {
          throw new Error(userErrorMessages.campus.invalid);
        }
        if (!isValidCampus(campus)) {
          throw new Error(userErrorMessages.campus.invalid);
        }
      }
      // If UiTM email, campus is required
      if (req.body.email && isValidUiTMEmail(req.body.email) && !campus) {
        throw new Error(userErrorMessages.campus.required);
      }
      return true;
    })
    .withMessage(userErrorMessages.campus.invalid);
};

const facultyValidation = (fieldName = "profile.faculty") => {
  return body(fieldName)
    .optional() // ✅ CHANGED: Optional for all users
    .trim()
    .custom((faculty, { req }) => {
      // If faculty is provided, validate it
      if (faculty) {
        if (!Object.keys(FacultyEnum).includes(faculty)) {
          throw new Error(userErrorMessages.faculty.invalid);
        }
        if (!isValidFaculty(faculty)) {
          throw new Error(userErrorMessages.faculty.invalid);
        }
      }
      // If UiTM email, faculty is required
      if (req.body.email && isValidUiTMEmail(req.body.email) && !faculty) {
        throw new Error(userErrorMessages.faculty.required);
      }
      return true;
    })
    .withMessage(userErrorMessages.faculty.invalid);
};

const roleValidation = (fieldName = "roles") => {
  return body(fieldName)
    .optional()
    .isArray({ min: 1 })
    .withMessage("Roles must be a non-empty array")
    .bail()
    .custom((roles) => {
      return isValidRoleArray(roles);
    })
    .withMessage(userErrorMessages.rolesArray.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

const validateRegister = [
  emailValidation("email"),
  passwordValidation("password"),
  usernameValidation("profile.username"),
  bioValidation("profile.bio"),
  phoneNumberValidation("profile.phoneNumber"),
  campusValidation("profile.campus"),
  facultyValidation("profile.faculty"),
  roleValidation("roles"),

  handleValidationErrors,
];

const validateLogin = [
  emailValidation("email"),
  passwordValidation("password"),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,

  handleValidationErrors,
  emailValidation,
  passwordValidation,
  usernameValidation,
  phoneNumberValidation,
  bioValidation,
  campusValidation,
  facultyValidation,
  roleValidation,
};
