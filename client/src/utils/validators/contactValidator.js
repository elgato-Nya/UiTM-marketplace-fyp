/**
 * Contact Form Validator (Frontend)
 *
 * PURPOSE: Provide client-side validation for contact forms
 * MATCHES: Backend ContactValidator validation rules
 * USAGE: Validate form inputs before submission
 */

export const contactValidator = {
  /**
   * Validates contact name using recipient name rules
   * Accepts alphanumeric characters, one "@" symbol, and one "/" symbol
   * @param {string} name
   * @returns {Object} { valid: boolean, error: string }
   */
  validateName(name) {
    if (!name || typeof name !== "string") {
      return { valid: false, error: "Name is required" };
    }

    const trimmedName = name.trim();

    // Check @ and / symbols
    const atCount = (trimmedName.match(/@/g) || []).length;
    const slashCount = (trimmedName.match(/\//g) || []).length;

    if (atCount > 1) {
      return { valid: false, error: "Name can contain only one '@' symbol" };
    }

    if (slashCount > 1) {
      return { valid: false, error: "Name can contain only one '/' symbol" };
    }

    // Check pattern and length (added 0-9 to allow numbers like "Meow2222")
    if (!/^[A-Za-z0-9@\/ ]{4,100}$/.test(trimmedName)) {
      return {
        valid: false,
        error:
          "Name must be 4-100 characters and contain only letters, numbers, '@', '/', and spaces",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates Malaysian phone number format
   * Must start with 0 and be 10 or 11 digits long
   * @param {string} phoneNumber
   * @returns {Object} { valid: boolean, error: string }
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      return { valid: true, error: null }; // Optional field
    }

    if (typeof phoneNumber !== "string") {
      return { valid: false, error: "Phone number must be a string" };
    }

    if (!/^0\d{9,10}$/.test(phoneNumber)) {
      return {
        valid: false,
        error: "Phone number must start with 0 and be 10 or 11 digits long",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates email format
   * @param {string} email
   * @returns {Object} { valid: boolean, error: string }
   */
  validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { valid: false, error: "Email is required" };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { valid: false, error: "Please provide a valid email address" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates subject line
   * @param {string} subject
   * @returns {Object} { valid: boolean, error: string }
   */
  validateSubject(subject) {
    if (!subject || typeof subject !== "string") {
      return { valid: false, error: "Subject is required" };
    }

    const trimmed = subject.trim();

    if (trimmed.length < 5) {
      return { valid: false, error: "Subject must be at least 5 characters" };
    }

    if (trimmed.length > 200) {
      return { valid: false, error: "Subject cannot exceed 200 characters" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates message content
   * @param {string} message
   * @returns {Object} { valid: boolean, error: string }
   */
  validateMessage(message) {
    if (!message || typeof message !== "string") {
      return { valid: false, error: "Message is required" };
    }

    const trimmed = message.trim();

    if (trimmed.length < 10) {
      return { valid: false, error: "Message must be at least 10 characters" };
    }

    if (trimmed.length > 2000) {
      return { valid: false, error: "Message cannot exceed 2000 characters" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates bug description fields
   * @param {string} description
   * @param {boolean} isRequired - Whether field is required
   * @returns {Object} { valid: boolean, error: string }
   */
  validateBugDescription(description, isRequired = false) {
    if (!description || !description.trim()) {
      if (isRequired) {
        return {
          valid: false,
          error: "This field is required for bug reports",
        };
      }
      return { valid: true, error: null }; // Optional
    }

    if (typeof description !== "string") {
      return { valid: false, error: "Description must be a string" };
    }

    const trimmed = description.trim();

    if (isRequired && trimmed.length < 10) {
      return {
        valid: false,
        error: "Description must be at least 10 characters",
      };
    }

    if (trimmed.length > 500) {
      return {
        valid: false,
        error: "Description cannot exceed 500 characters",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates steps to reproduce
   * @param {string} steps
   * @param {boolean} isRequired - Whether field is required
   * @returns {Object} { valid: boolean, error: string }
   */
  validateStepsToReproduce(steps, isRequired = false) {
    if (!steps || !steps.trim()) {
      if (isRequired) {
        return {
          valid: false,
          error: "Steps to reproduce are required for bug reports",
        };
      }
      return { valid: true, error: null }; // Optional
    }

    if (typeof steps !== "string") {
      return { valid: false, error: "Steps must be a string" };
    }

    const trimmed = steps.trim();

    if (trimmed.length > 1000) {
      return { valid: false, error: "Steps cannot exceed 1000 characters" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates organization name
   * @param {string} orgName
   * @returns {Object} { valid: boolean, error: string }
   */
  validateOrganizationName(orgName) {
    if (!orgName) {
      return { valid: true, error: null }; // Optional
    }

    if (typeof orgName !== "string") {
      return { valid: false, error: "Organization name must be a string" };
    }

    const trimmed = orgName.trim();

    if (trimmed.length < 2) {
      return {
        valid: false,
        error: "Organization name must be at least 2 characters",
      };
    }

    if (trimmed.length > 200) {
      return {
        valid: false,
        error: "Organization name cannot exceed 200 characters",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates website URL
   * @param {string} website
   * @returns {Object} { valid: boolean, error: string }
   */
  validateWebsite(website) {
    if (!website) {
      return { valid: true, error: null }; // Optional
    }

    if (typeof website !== "string") {
      return { valid: false, error: "Website must be a string" };
    }

    const urlPattern =
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

    if (!urlPattern.test(website)) {
      return { valid: false, error: "Please provide a valid website URL" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates browser information
   * @param {string} browser
   * @returns {Object} { valid: boolean, error: string }
   */
  validateBrowser(browser) {
    if (!browser) {
      return { valid: true, error: null }; // Optional
    }

    if (typeof browser !== "string") {
      return { valid: false, error: "Browser must be a string" };
    }

    if (browser.length > 100) {
      return {
        valid: false,
        error: "Browser information cannot exceed 100 characters",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates image file for upload
   * @param {File} file
   * @returns {Object} { valid: boolean, error: string }
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: "Please select an image" };
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Image must be JPEG, PNG, or GIF format",
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Image size cannot exceed 5MB",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates multiple images
   * @param {FileList|Array} files
   * @returns {Object} { valid: boolean, error: string }
   */
  validateImages(files) {
    if (!files || files.length === 0) {
      return { valid: true, error: null }; // Optional
    }

    if (files.length > 5) {
      return {
        valid: false,
        error: "Maximum 5 images allowed per submission",
      };
    }

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const result = this.validateImage(files[i]);
      if (!result.valid) {
        return {
          valid: false,
          error: `Image ${i + 1}: ${result.error}`,
        };
      }
    }

    return { valid: true, error: null };
  },
};

export default contactValidator;
