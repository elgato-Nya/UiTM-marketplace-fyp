const { body, param, validationResult } = require("express-validator");

const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
const {
  isValidUiTMEmail,
  isValidPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidMongoId,
  isValidRoleArray,
  isValidCampus,
  isValidFaculty,
  isValidBio,
  getErrorMessages,
} = require("../../utils/validators/user.validator");
const logger = require("../../utils/logger");

const errorMessages = getErrorMessages();

// ================ VALIDATION ERROR MIDDLEWARE =================

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

const emailValidation = (fieldName = "email") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .toLowerCase()
    .isEmail()
    .normalizeEmail()
    .custom((email) => {
      if (!isValidUiTMEmail(email)) {
        throw new Error(errorMessages.email);
      }
      return true;
    });
};

const passwordValidation = (fieldName = "password") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be between 8 and 24 characters long")
    .custom((password) => {
      if (!isValidPassword(password)) {
        throw new Error(errorMessages.password);
      }
      return true;
    });
};

const usernameValidation = (fieldName = "profile.username") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .isLength({ min: 6, max: 16 })
    .withMessage("Username must be between 6 and 16 characters long")
    .custom((username) => {
      if (!isValidUsername(username)) {
        throw new Error(errorMessages.username);
      }
      return true;
    });
};

const phoneNumberValidation = (fieldName = "profile.phoneNumber") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Phone number is required")
    .trim()
    .custom((phoneNumber) => {
      if (!isValidPhoneNumber(phoneNumber)) {
        throw new Error(errorMessages.phoneNumber);
      }
      return true;
    });
};

const bioValidation = (fieldName = "profile.bio") => {
  return body(fieldName)
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Bio must be at most 250 characters long")
    .custom((bio) => {
      if (bio && !isValidBio(bio)) {
        throw new Error(errorMessages.bio);
      }
      return true;
    });
};

const campusValidation = (fieldName = "profile.campus") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Campus is required")
    .trim()
    .isIn(Object.keys(CampusEnum))
    .withMessage("Invalid campus value")
    .custom((campus) => {
      if (!isValidCampus(campus)) {
        throw new Error(errorMessages.campus);
      }
      return true;
    });
};

const facultyValidation = (fieldName = "profile.faculty") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Faculty is required")
    .trim()
    .isIn(Object.keys(FacultyEnum))
    .withMessage("Invalid faculty value")
    .custom((faculty) => {
      if (!isValidFaculty(faculty)) {
        throw new Error(errorMessages.faculty);
      }
      return true;
    });
};

const roleValidation = (fieldName = "role") => {
  return body(fieldName)
    .optional()
    .isArray({ min: 1 })
    .withMessage("Role must be a non-empty array")
    .custom((roles) => {
      if (!isValidRoleArray(roles)) {
        throw new Error(errorMessages.roleArray);
      }
      return true;
    });
};

const mongoIdValidation = (paramName = "id") => {
  return param(paramName).custom((value) => {
    if (!isValidMongoId(value)) {
      throw new Error(errorMessages.mongoId);
    }
    return true;
  });
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
  roleValidation("role"),

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
  mongoIdValidation,
  emailValidation,
  passwordValidation,
  usernameValidation,
  phoneNumberValidation,
  bioValidation,
  campusValidation,
  facultyValidation,
  roleValidation,
};
