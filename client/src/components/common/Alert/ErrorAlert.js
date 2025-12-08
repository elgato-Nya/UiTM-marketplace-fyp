import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import Alert from "./Alert";

/**
 * Error Alert Component
 *
 * Specialized alert for displaying error messages
 * Automatically handles error objects and provides fallback messages
 * Enhanced to display validation errors with detailed information
 */
const ErrorAlert = ({
  error,
  message = null,
  fallback = "An error occurred. Please try again.",
  ...props
}) => {
  // Don't render if no error
  if (!error) return null;

  // Extract error details from various error formats
  const errorDetails = error?.details || error?.response?.data || error?.data;
  const validationErrors = errorDetails?.errors;
  const errorHint = errorDetails?.hint;

  // Extract error message from various error formats
  const errorMessage =
    message ||
    error?.message ||
    errorDetails?.message ||
    (typeof error === "string" ? error : fallback);

  // If we have validation errors, display them in a detailed format
  if (
    validationErrors &&
    Array.isArray(validationErrors) &&
    validationErrors.length > 0
  ) {
    return (
      <Alert severity="error" title="Validation Error" {...props}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {errorMessage}
        </Typography>
        {errorHint && (
          <Typography
            variant="body2"
            sx={{ mb: 1, fontStyle: "italic", opacity: 0.9 }}
          >
            {errorHint}
          </Typography>
        )}
        <List dense sx={{ mt: 1 }}>
          {validationErrors.map((err, index) => (
            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" component="span">
                    <strong>{err.field}:</strong> {err.message}
                  </Typography>
                }
                secondary={
                  err.value && (
                    <Typography variant="caption" color="text.secondary">
                      Received value: "{String(err.value)}"
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    );
  }

  // Standard error display
  return (
    <Alert severity="error" {...props}>
      <Typography variant="body2">{errorMessage}</Typography>
      {errorHint && (
        <Typography
          variant="body2"
          sx={{ mt: 1, fontStyle: "italic", opacity: 0.9 }}
        >
          {errorHint}
        </Typography>
      )}
    </Alert>
  );
};

export default ErrorAlert;
