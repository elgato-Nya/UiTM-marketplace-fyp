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
   */
  static isValidUiTMEmail(email) {
    if (!email || typeof email !== "string") return false;
    return /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/.test(email.toLowerCase());
  }

  /**
   * Validates password strength
   * @param {string} password
   * @returns {boolean}
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
   */
  static isValidUsername(username) {
    if (!username || typeof username !== "string") return false;

    return (
      /^[a-zA-Z0-9][a-zA-Z0-9_-]{5,15}$/.test(username) &&
      !/[-_]{2,}/.test(username) &&
      !/^[-_]/.test(username) &&
      !/[ -]/.test(username) &&
      !/[-_]$/.test(username)
    );
  }

  /**
   * Validates Malaysian phone number format
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  static isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== "string") return false;
    return /^(0\d{9,10})$/.test(phoneNumber);
  }

  /**
   * Validates MongoDB ObjectId format
   * @param {string} id
   * @returns {boolean}
   */
  static isValidMongoId(id) {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

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
   * Validates campus enum value
   * @param {string} campus
   * @returns {boolean}
   */
  static isValidCampus(campus) {
    if (!campus || typeof campus !== "string") return false;
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
   * Validates bio length and content
   * @param {string} bio
   * @returns {boolean}
   */
  static isValidBio(bio) {
    if (!bio) return true; // bio is optional
    return typeof bio === "string" && bio.trim().length <= 250;
  }

  /**
   * Validates profile fields
   * @param {Object} profile
   * @returns {boolean}
   */
  static isValidProfileUpdate(profile) {
    if (!profile || typeof profile !== "object") return false;

    const allowedFields = ["avatar", "bio", "phoneNumber", "campus", "faculty"];
    const providedFields = Object.keys(profile);

    return providedFields.every((field) => allowedFields.includes(field));
  }

  /**
   * Returns error messages for validation failures
   * @returns {Object}
   */
  static userErrorMessages() {
    return {
      email:
        "Email must be a valid UiTM email address (e.g., user@uitm.edu.my)",
      password:
        "Password must be 8-24 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      username:
        "Username must be between 6 and 16 characters, start with a letter or number, and can only contain letters, numbers, underscores, and hyphens. No consecutive special characters or ending with special characters",
      avatar: "Avatar must be a valid URL or base64 image",
      phoneNumber: "Phone number must start with 0 and be 10 or 11 digits long",
      mongoId: "Invalid ID format",
      roleArray:
        "Role must be a non-empty array with valid roles (consumer, merchant, admin)",
      role: "Role must be one of: consumer, merchant, admin",
      campus: "Invalid campus value",
      faculty: "Invalid faculty value",
      bio: "Bio cannot exceed 200 characters",
      profileUpdate: "Invalid profile fields provided",
      directFieldUpdate: "Invalid direct field update",
      noValidFields: "No valid fields provided for update",
      forbiddenField: "This field cannot be updated through this endpoint",
    };
  }
}

module.exports = UserValidator;
