import {
  CAMPUS_OPTIONS,
  FACULTY_OPTIONS,
  STATE_OPTIONS,
} from "../../constants/authConstant";

export const loginFormConfig = {
  title: "Welcome Back!",
  subtitle: "Sign in to your UiTM Marketplace account",
  submitText: "Sign In",
  defaultValues: {
    email: "",
    password: "",
  },
  fields: [
    {
      name: "email",
      type: "email",
      label: "Email Address",
      placeholder: "your@email.com",
      required: true,
      helperText: "Use any valid email address",
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      required: true,
    },
  ],
};

export const registerFormConfig = {
  title: "Join UiTM Marketplace",
  subtitle: "Create your account to get started",
  submitText: "Create Account",
  maxWidth: 500,
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: "",
    profile: {
      username: "",
      phoneNumber: "",
      campus: "",
      faculty: "",
    },
    termsAccepted: false,
  },
  steps: [
    {
      label: "Account Information",
      subtitle: "Set up your account credentials",
      fields: [
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "your@email.com",
          required: true,
          helperText:
            "Any email accepted. UiTM emails get instant merchant access! 🎉",
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          placeholder: "Create a strong password",
          required: true,
          helperText:
            "At least 8 characters with uppercase, lowercase, and number or with special characters",
        },
        {
          name: "confirmPassword",
          type: "password",
          label: "Confirm Password",
          placeholder: "Re-enter your password",
          required: true,
        },
      ],
    },
    {
      label: "Profile Details",
      subtitle: "Personalize your profile",
      fields: [
        {
          name: "profile.username",
          type: "text",
          label: "Username",
          placeholder: "Choose a unique username",
          required: true,
          helperText:
            "6-16 characters, start with letter/number. Use letters, numbers, _ or -",
        },
        {
          name: "profile.phoneNumber",
          type: "tel",
          label: "Phone Number",
          placeholder: "e.g., 0123456789",
          required: true,
        },
        {
          name: "profile.campus",
          type: "select",
          label: "Campus",
          required: true,
          options: CAMPUS_OPTIONS,
        },
        {
          name: "profile.faculty",
          type: "select",
          label: "Faculty",
          required: true,
          options: FACULTY_OPTIONS,
        },
      ],
    },
    // todo: maybe add email verification step here or at credentials step idk. we'll see
    // todo: add another step for terms and conditions ??
  ],
};

export const forgotPasswordFormConfig = {
  title: "Forgot Password?",
  subtitle: "Enter your email to receive a password reset link",
  submitText: "Send Reset Link",
  maxWidth: 400,
  defaultValues: {
    email: "",
  },
  fields: [
    {
      name: "email",
      type: "email",
      label: "UiTM Email Address",
      placeholder: "email@uitm.edu.my",
      required: true,
      helperText: "Enter the email associated with your account",
    },
  ],
};
