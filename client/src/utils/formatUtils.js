import { CAMPUS_OPTIONS, FACULTY_OPTIONS } from "../constants/authConstant";
import { STATE_OPTIONS } from "../constants/addressConstant";

/**
 * Format Utilities
 *
 * PURPOSE: Common formatting functions for displaying data
 * FEATURES:
 * - Campus value to label mapping
 * - Faculty value to label mapping
 * - State value to label mapping
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
 * Get human-readable state label from state value
 * @param {string} stateValue - State value (e.g., "SELANGOR")
 * @returns {string} State label (e.g., "Selangor") or the original value
 *
 * @example
 * getStateLabel("SELANGOR") // "Selangor"
 * getStateLabel("KUALA_LUMPUR") // "Kuala Lumpur"
 * getStateLabel(null) // "N/A"
 */
export const getStateLabel = (stateValue) => {
  if (!stateValue) return "N/A";

  const state = STATE_OPTIONS.find((option) => option.value === stateValue);
  return state ? state.label : stateValue;
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

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {boolean} isFree - Whether the item is free
 * @returns {string} Formatted price with RM prefix
 *
 * @example
 * formatPrice(1234.56) // "RM 1,234.56"
 * formatPrice(1500000) // "RM 1.5m"
 * formatPrice(0, true) // "FREE"
 */
export const formatPrice = (price, isFree = false) => {
  if (isFree || price === 0) return "FREE";

  // Use compact notation for large numbers
  if (price >= 100000) {
    if (price >= 1000000000) {
      return `RM ${(price / 1000000000).toFixed(1)}b`;
    }
    if (price >= 1000000) {
      return `RM ${(price / 1000000).toFixed(1)}m`;
    }
    return `RM ${(price / 1000).toFixed(1)}k`;
  }

  // Format with commas for readability
  return `RM ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};
