import { CAMPUS_OPTIONS, FACULTY_OPTIONS } from "../constants/authConstant";

/**
 * Format Utilities
 *
 * PURPOSE: Common formatting functions for displaying data
 * FEATURES:
 * - Campus value to label mapping
 * - Faculty value to label mapping
 * - Other display formatting helpers
 */

/**
 * Get human-readable campus label from campus value
 * @param {string} campusValue - Campus value (e.g., "SHAH_ALAM")
 * @returns {string} Campus label (e.g., "UiTM Shah Alam") or "N/A"
 *
 * @example
 * getCampusLabel("SHAH_ALAM") // "UiTM Shah Alam"
 * getCampusLabel("INVALID") // "N/A"
 * getCampusLabel(null) // "N/A"
 */
export const getCampusLabel = (campusValue) => {
  if (!campusValue) return "N/A";

  const campus = CAMPUS_OPTIONS.find((option) => option.value === campusValue);
  return campus ? campus.label : campusValue;
};

/**
 * Get human-readable faculty label from faculty value
 * @param {string} facultyValue - Faculty value (e.g., "COMPUTER_SCIENCE_MATH")
 * @returns {string} Faculty label (e.g., "Fakulti Sains Komputer dan Matematik") or "N/A"
 *
 * @example
 * getFacultyLabel("COMPUTER_SCIENCE_MATH") // "Fakulti Sains Komputer dan Matematik"
 * getFacultyLabel("INVALID") // "N/A"
 * getFacultyLabel(null) // "N/A"
 */
export const getFacultyLabel = (facultyValue) => {
  if (!facultyValue) return "N/A";

  const faculty = FACULTY_OPTIONS.find(
    (option) => option.value === facultyValue
  );
  return faculty ? faculty.label : facultyValue;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis
 *
 * @example
 * truncateText("This is a very long text", 10) // "This is a..."
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Phone number string
 * @returns {string} Formatted phone number or "N/A"
 *
 * @example
 * formatPhoneNumber("01162033072") // "011-6203-3072"
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "N/A";

  // Malaysian phone number format: 01X-XXXX-XXXX
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.length === 10 || cleaned.length === 11) {
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  return phoneNumber;
};
