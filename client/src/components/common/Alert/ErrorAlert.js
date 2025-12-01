import Alert from "./Alert";

/**
 * Error Alert Component
 *
 * Specialized alert for displaying error messages
 * Automatically handles error objects and provides fallback messages
 */
const ErrorAlert = ({
  error,
  message = null,
  fallback = "An error occurred. Please try again.",
  ...props
}) => {
  // Don't render if no error
  if (!error) return null;

  // Extract error message from various error formats
  const errorMessage =
    message ||
    error?.message ||
    error?.data?.message ||
    error?.response?.data?.message ||
    (typeof error === "string" ? error : fallback);

  return <Alert severity="error" message={errorMessage} {...props} />;
};

export default ErrorAlert;
