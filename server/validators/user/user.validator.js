const { CampusEnum, FacultyEnum } = require("../../enums/user.enum");
/**
 * Pure validation functions for user-related data
 * These functions only validate and return boolean results
 */
class UserValidator {
  /**
   * Validates UiTM email format
   * @param {string} email
   * @returns {boolean}
   * NOTE: email must be a valid UiTM email address (e.g., user@uitm.edu.my)
   */
  static isValidUiTMEmail(email) {
    if (!email || typeof email !== "string") return false;
    return /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/.test(email.toLowerCase());
  }

  /**
   * Validates password strength
   * @param {string} password
   * @returns {boolean}
   * NOTE: password length must be in between 8–24 characters long,
   *       and must contains at least one lowercase letter, one uppercase letter, and one digit
   */
  static isValidPassword(password) {
    if (!password || typeof password !== "string") return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\+\-=]{8,24}$/.test(
      password
    );
  }

  /**
   * Validates username format
   * @param {string} username
   * @returns {boolean}
   * NOTE: username must be 6-16 characters, start with a letter or number,
   *       can only contain letters, numbers, underscores, and hyphens,
   *       no consecutive special characters, cannot start or end with special characters,
   *       and cannot contain spaces.
   */
  static isValidUsername(username) {
    if (!username || typeof username !== "string") return false;

    return (
      /^[a-zA-Z0-9][a-zA-Z0-9_-]{5,15}$/.test(username) && // 6-16 chars, starts with letter/number, allowed chars
      !/[-_]{2,}/.test(username) && // no consecutive special chars
      !/^[-_]/.test(username) && // cannot start with special char
      !/[ -]/.test(username) && // no spaces
      !/[-_]$/.test(username) // cannot end with special char
    );
  }

  /**
   * Validates Malaysian phone number format
   * @param {string} phoneNumber
   * @returns {boolean}
   * NOTE: phone number must start with 0 and be 10 or 11 digits long (e.g., 0123456789 or 01234567890)
   */
  static isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== "string") return false;
    return /^0\d{9,10}$/.test(phoneNumber);
  }

  /**
   * Validates MongoDB ObjectId format
   * @param {string} id
   * @returns {boolean}
   * NOTE: id must be a 24-character hexadecimal string (e.g., 507f1f77bcf86cd799439011)
   */
  static isValidMongoId(id) {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Validates avatar format
   * @param {string} avatar
   * @returns {boolean}
   * NOTE: avatar must be a valid URL (starting with http/https) or a valid base64 image string (e.g., data:image/png;base64,...)
   */
  static isValidAvatar = (avatar) => {
    if (!avatar || typeof avatar !== "string") return false;

    // Allow URLs or base64 images
    const urlPattern = /^https?:\/\/.+/;
    const base64Pattern = /^data:image\/(jpeg|jpg|png|gif);base64,/;

    return urlPattern.test(avatar) || base64Pattern.test(avatar);
  };

  /**
   * Validates user role array
   * @param {Array} roles
   * @returns {boolean}
   */
  static isValidRoleArray(roles) {
    if (!Array.isArray(roles) || roles.length === 0) return false;

    const allowedRoles = ["consumer", "merchant", "admin"];
    return roles.every((role) => allowedRoles.includes(role));
  }

  /**
   * Validates single role
   * @param {string} role
   * @returns {boolean}
   */
  static isValidRole(role) {
    if (!role || typeof role !== "string") return false;
    const allowedRoles = ["consumer", "merchant", "admin"];
    return allowedRoles.includes(role);
  }

  /**
   * Validates campus enum value with performance optimization
   * @param {string} campus
   * @returns {boolean}
   */
  static isValidCampus(campus) {
    if (!campus || typeof campus !== "string") return false;

    // Performance optimization: Skip validation for already-stored enum keys
    // This prevents re-validating existing addresses when adding new ones
    if (Object.keys(CampusEnum).includes(campus)) {
      return true; // Already a valid stored enum key
    }

    // Validate display values (for new input)
    return Object.values(CampusEnum).includes(campus);
  }

  /**
   * Validates faculty enum value
   * @param {string} faculty
   * @returns {boolean}
   */
  static isValidFaculty(faculty) {
    if (!faculty || typeof faculty !== "string") return false;
    return Object.values(FacultyEnum).includes(faculty);
  }

  /**
   * Validates bio field
   * @param {string} bio
   * @returns {boolean}
   */
  static isValidBio(bio) {
    if (!bio) return true; // Bio is optional
    if (typeof bio !== "string") return false;
    return bio.length <= 200;
  }
}

/**
 * Returns error messages for validation failures
 */
const userErrorMessages = () => ({
  email: {
    required: "Email is required",
    invalid:
      "Email must be a valid UiTM email address (e.g., user@uitm.edu.my)",
    unique: "Email already exists",
  },
  password: {
    required: "Password is required",
    invalid:
      "Password must be 8-24 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
  },
  username: {
    required: "Username is required",
    invalid:
      "Username must be between 6 and 16 characters, start with a letter or number, and can only contain letters, numbers, underscores, and hyphens. No consecutive special characters or ending with special characters",
    unique: "Username already exists",
  },
  avatar: {
    invalid: "Avatar must be a valid URL or base64 image",
  },
  phoneNumber: {
    invalid: "Phone number must start with 0 and be 10 or 11 digits long",
  },
  mongoId: {
    invalid: "Invalid ID format",
  },
  role: {
    required: "Role is required",
    invalid: "Role must be one of: consumer, merchant, admin",
  },
  roleArray: {
    invalid:
      "Role must be a non-empty array with valid roles (consumer, merchant, admin)",
  },
  campus: {
    invalid: "Invalid campus value",
  },
  faculty: {
    invalid: "Invalid faculty value",
  },
  bio: {
    invalid: "Bio cannot exceed 200 characters",
  },
  profile: {
    invalid: "Invalid profile fields provided",
    noValidFields: "No valid fields provided for update",
    forbiddenField: "This field cannot be updated through this endpoint",
  },
});

module.exports = {
  UserValidator,
  userErrorMessages,
};
