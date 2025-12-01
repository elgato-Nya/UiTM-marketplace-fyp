import * as yup from "yup";

import { CAMPUS_OPTIONS, FACULTY_OPTIONS } from "../constants/authConstant";

// Used in login and register
const errorMessages = {
  email: {
    required: "Email is required",
    invalid:
      "Email must be a valid UiTM email address (e.g., user@uitm.edu.my)",
  },
  password: {
    required: "Password is required",
    invalid: {
      length: "Password must be between 8 and 24 characters long",
      format:
        "Password must be 8-24 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    invalid: "Both passwords must match",
  },
  username: {
    required: "Username is required",
    invalid: {
      format:
        "Username must start with a letter or number, and can only contain letters, numbers, _ and -",
      length: "Username must be between 6 and 16 characters long",
    },
  },
  phoneNumber: {
    required: "Phone number is required",
    invalid: "Phone number must start with 0 and be 10 or 11 digits long",
  },
  campus: {
    required: "Campus is required",
    invalid: "Invalid campus value",
  },
  faculty: {
    required: "Faculty is required",
    invalid: "Invalid faculty value",
  },
};

export const loginValidation = yup.object().shape({
  email: yup
    .string()
    .required(errorMessages.email.required)
    .email(errorMessages.email.invalid)
    .matches(
      /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/,
      errorMessages.email.invalid
    ),

  password: yup
    .string()
    .required(errorMessages.password.required)
    .min(8, errorMessages.password.invalid.length)
    .max(24, errorMessages.password.invalid.length)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-=]{8,24}$/,
      errorMessages.password.invalid.format
    ),
});

// ?? add terms and conditions checkbox?
export const registerValidator = yup.object().shape({
  email: yup
    .string()
    .required(errorMessages.email.required)
    .email(errorMessages.email.invalid)
    .matches(
      /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/,
      errorMessages.email.invalid
    ),

  password: yup
    .string()
    .required(errorMessages.password.required)
    .min(8, errorMessages.password.invalid.length)
    .max(24, errorMessages.password.invalid.length)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-=]{8,24}$/,
      errorMessages.password.invalid.format
    ),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], errorMessages.confirmPassword.invalid)
    .required(errorMessages.confirmPassword.required),

  profile: yup.object().shape({
    username: yup
      .string()
      .required(errorMessages.username.required)
      .min(6, errorMessages.username.invalid.length)
      .max(16, errorMessages.username.invalid.length)
      .matches(
        /^[a-zA-Z0-9][a-zA-Z0-9_-]{5,15}$/, // 6-16 chars, starts with letter/number, allowed chars
        errorMessages.username.invalid.format
      )
      .matches(
        /^(?!.*[-_]{2,})/, // no consecutive special chars
        errorMessages.username.invalid.format
      )
      .matches(
        /^(?![-_])/, // cannot start with special char
        errorMessages.username.invalid.format
      )
      .matches(
        /^[^\s-]*$/, // no spaces
        errorMessages.username.invalid.format
      )
      .matches(
        /^(?!.*[-_]$)/, // cannot end with special char
        errorMessages.username.invalid.format
      ),

    phoneNumber: yup
      .string()
      .required(errorMessages.phoneNumber.required)
      .matches(/^0\d{9,10}$/, errorMessages.phoneNumber.invalid),

    campus: yup
      .string()
      .required(errorMessages.campus.required)
      .oneOf(
        CAMPUS_OPTIONS.map((c) => c.value),
        errorMessages.campus.invalid
      ),

    faculty: yup
      .string()
      .required(errorMessages.faculty.required)
      .oneOf(
        FACULTY_OPTIONS.map((f) => f.value),
        errorMessages.faculty.invalid
      ),
  }),
});

// ! implement this one day
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email")
    .matches(
      /@student\.uitm\.edu\.my$|@uitm\.edu\.my$/,
      "Please use your UiTM email address"
    ),
});
