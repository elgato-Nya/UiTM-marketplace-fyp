import React from "react";
import { Alert, Typography, Box } from "@mui/material";

/**
 * Form Alerts Component
 * Displays success messages and validation errors
 */
function FormAlerts({ submitSuccess, validationErrors }) {
  if (!submitSuccess && Object.keys(validationErrors).length === 0) {
    return null;
  }

  return (
    <>
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Thank you for contacting us!
          </Typography>
          <Typography variant="caption">
            We've received your submission and will respond shortly.
          </Typography>
        </Alert>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Please fix the following errors:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {Object.values(validationErrors).map((error, index) => (
              <Typography key={index} variant="caption" component="li">
                {error}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}
    </>
  );
}

export default FormAlerts;
