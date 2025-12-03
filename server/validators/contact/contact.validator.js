const { UserValidator } = require("../user/user.validator");
const { AddressValidator } = require("../user/address.validator");

/**
 * Contact Form Validator
 *
 * PURPOSE: Provide reusable validation methods for contact form submissions
 * SCOPE: Validates name, phone, text fields, and file uploads
 * REUSES: Existing validation rules from UserValidator and AddressValidator
 */

class ContactValidator {
  /**
   * Validates contact name using recipient name rules
   * Accepts only alphabet (lower/uppercase), only one "@" symbol, and only one "/" symbol
   * @param {string} name
   * @returns {boolean}
   */
  static isValidContactName(name) {
    return AddressValidator.isValidRecipientName(name);
  }

  /**
   * Validates phone number using Malaysian phone format
   * Must start with 0 and be 10 or 11 digits long (e.g., 0123456789)
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  static isValidContactPhone(phoneNumber) {
    if (!phoneNumber) return true; // Optional field
    return UserValidator.isValidPhoneNumber(phoneNumber);
  }

  /**
   * Validates subject line
   * @param {string} subject
   * @returns {boolean}
   */
  static isValidSubject(subject) {
    if (!subject || typeof subject !== "string") return false;
    const trimmed = subject.trim();
    if (trimmed.length < 5) return false;
    if (trimmed.length > 200) return false;
    return true;
  }

  /**
   * Validates message content using bio rules (extended length)
   * @param {string} message
   * @returns {boolean}
   */
  static isValidMessage(message) {
    if (!message || typeof message !== "string") return false;
    const trimmed = message.trim();
    if (trimmed.length < 10) return false;
    if (trimmed.length > 2000) return false;
    return true;
  }

  /**
   * Validates bug description fields (REQUIRED for bug reports)
   * @param {string} description
   * @param {boolean} isRequired - Whether field is required
   * @returns {boolean}
   */
  static isValidBugDescription(description, isRequired = false) {
    if (!description) return !isRequired; // Required or optional based on flag
    if (typeof description !== "string") return false;
    const trimmed = description.trim();
    if (isRequired && trimmed.length < 10) return false;
    return trimmed.length <= 500;
  }

  /**
   * Validates steps to reproduce (REQUIRED for bug reports)
   * @param {string} steps
   * @param {boolean} isRequired - Whether field is required
   * @returns {boolean}
   */
  static isValidStepsToReproduce(steps, isRequired = false) {
    if (!steps) return !isRequired; // Required or optional based on flag
    if (typeof steps !== "string") return false;
    const trimmed = steps.trim();
    if (isRequired && trimmed.length < 10) return false;
    return trimmed.length <= 1000;
  }

  /**
   * Validates organization name
   * @param {string} orgName
   * @returns {boolean}
   */
  static isValidOrganizationName(orgName) {
    if (!orgName) return true; // Optional
    if (typeof orgName !== "string") return false;
    const trimmed = orgName.trim();
    if (trimmed.length < 2) return false;
    if (trimmed.length > 200) return false;
    return true;
  }

  /**
   * Validates website URL
   * @param {string} website
   * @returns {boolean}
   */
  static isValidWebsite(website) {
    if (!website) return true; // Optional
    if (typeof website !== "string") return false;
    const urlPattern =
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlPattern.test(website);
  }

  /**
   * Validates browser information
   * @param {string} browser
   * @returns {boolean}
   */
  static isValidBrowser(browser) {
    if (!browser) return true; // Optional
    if (typeof browser !== "string") return false;
    return browser.length <= 100;
  }

  /**
   * Validates submission type
   * @param {string} type
   * @returns {boolean}
   */
  static isValidSubmissionType(type) {
    const validTypes = ["bug", "enquiry", "feedback", "collaboration", "other"];
    return validTypes.includes(type);
  }

  /**
   * Validates bug severity
   * @param {string} severity
   * @returns {boolean}
   */
  static isValidBugSeverity(severity) {
    if (!severity) return true;
    const validSeverities = ["low", "medium", "high", "critical"];
    return validSeverities.includes(severity);
  }

  /**
   * Validates device type
   * @param {string} deviceType
   * @returns {boolean}
   */
  static isValidDeviceType(deviceType) {
    if (!deviceType) return true;
    const validTypes = ["desktop", "mobile", "tablet"];
    return validTypes.includes(deviceType);
  }

  /**
   * Validates proposal type
   * @param {string} proposalType
   * @returns {boolean}
   */
  static isValidProposalType(proposalType) {
    if (!proposalType) return true;
    const validTypes = ["partnership", "sponsorship", "integration", "other"];
    return validTypes.includes(proposalType);
  }

  /**
   * Validates image file for bug reports and feedback
   * @param {Object} file - Multer file object
   * @returns {boolean}
   */
  static isValidContactImage(file) {
    if (!file) return false;

    // Check file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) return false;

    // Check file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return false;

    return true;
  }

  /**
   * Validates email format
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (!email || typeof email !== "string") return false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}

/**
 * Centralized error messages for contact validation
 */
const contactValidatorMessages = {
  name: {
    required: "Name is required",
    invalid:
      "Name must contain only letters, '@', '/' and be between 4 to 100 characters",
  },
  email: {
    required: "Email is required",
    invalid: "Please provide a valid email address",
  },
  phoneNumber: {
    invalid:
      "Phone number must start with 0 and be 10 or 11 digits long (e.g., 0123456789)",
  },
  subject: {
    required: "Subject is required",
    invalid: "Subject must be between 5 and 200 characters",
  },
  message: {
    required: "Message is required",
    invalid: "Message must be between 10 and 2000 characters",
  },
  bugDescription: {
    required: "Bug description is required for bug reports",
    invalid: "Description must be between 10 and 500 characters",
  },
  stepsToReproduce: {
    invalid: "Steps cannot exceed 1000 characters",
  },
  organizationName: {
    invalid: "Organization name must be between 2 and 200 characters",
  },
  website: {
    invalid: "Please provide a valid website URL",
  },
  browser: {
    invalid: "Browser information cannot exceed 100 characters",
  },
  submissionType: {
    required: "Submission type is required",
    invalid: "Invalid submission type",
  },
  bugSeverity: {
    invalid: "Invalid bug severity level",
  },
  deviceType: {
    invalid: "Invalid device type",
  },
  proposalType: {
    invalid: "Invalid proposal type",
  },
  image: {
    invalid: "Image must be JPEG, PNG, or GIF format",
    tooLarge: "Image size cannot exceed 5MB",
  },
};

module.exports = {
  ContactValidator,
  contactValidatorMessages,
};
