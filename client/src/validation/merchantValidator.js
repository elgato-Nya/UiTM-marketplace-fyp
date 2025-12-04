import * as yup from "yup";

/**
 * Merchant Validation Schemas
 *
 * PURPOSE: Validation for merchant verification and business email management
 * USAGE: Used in merchant verification forms and email settings
 */

const errorMessages = {
  verificationEmail: {
    required: "UiTM email is required for merchant verification",
    invalid:
      "Please enter a valid UiTM email address (e.g., student@uitm.edu.my)",
    format: "Must be a UiTM email address (@uitm.edu.my)",
  },
  businessEmail: {
    invalid: "Please enter a valid email address",
  },
};

/**
 * Merchant Verification Email Validation
 * Validates UiTM email format for merchant verification
 */
export const merchantVerificationSchema = yup.object().shape({
  verificationEmail: yup
    .string()
    .required(errorMessages.verificationEmail.required)
    .email(errorMessages.verificationEmail.invalid)
    .matches(
      /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/,
      errorMessages.verificationEmail.format
    ),
});

/**
 * Business Email Validation
 * Validates any email format for business contact
 */
export const businessEmailSchema = yup.object().shape({
  businessEmail: yup
    .string()
    .email(errorMessages.businessEmail.invalid)
    .nullable(),
});

/**
 * Helper: Check if email is UiTM domain
 */
export const isUiTMEmail = (email) => {
  if (!email) return false;
  return /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/.test(email.toLowerCase());
};

export default {
  merchantVerificationSchema,
  businessEmailSchema,
  isUiTMEmail,
  errorMessages,
};
