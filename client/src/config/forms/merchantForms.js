/**
 * Merchant Form Configurations
 *
 * PURPOSE: Form configs for merchant verification and email management
 * USAGE: Used with DynamicForm component
 */

export const merchantVerificationFormConfig = {
  title: "Become a Merchant",
  subtitle: "Verify your UiTM email to start selling",
  submitText: "Submit for Verification",
  maxWidth: 500,
  defaultValues: {
    verificationEmail: "",
  },
  fields: [
    {
      name: "verificationEmail",
      type: "email",
      label: "UiTM Email Address",
      placeholder: "student@uitm.edu.my",
      required: true,
      helperText:
        "This email will be kept private and used only for merchant verification",
    },
  ],
};

export const businessEmailFormConfig = {
  title: "Business Contact Email",
  subtitle: "Update your public contact email for customers",
  submitText: "Save Business Email",
  maxWidth: 450,
  defaultValues: {
    businessEmail: "",
  },
  fields: [
    {
      name: "businessEmail",
      type: "email",
      label: "Business Email (Optional)",
      placeholder: "contact@myshop.com",
      required: false,
      helperText:
        "This email will be visible to customers in your shop profile",
    },
  ],
};

export const merchantVerificationTokenFormConfig = {
  title: "Verify Your UiTM Email",
  subtitle: "Enter the verification token from your email",
  submitText: "Verify Email",
  maxWidth: 400,
  defaultValues: {
    token: "",
  },
  fields: [
    {
      name: "token",
      type: "text",
      label: "Verification Token",
      placeholder: "Enter token from email",
      required: true,
      helperText: "Check your UiTM inbox for the verification email",
    },
  ],
};
