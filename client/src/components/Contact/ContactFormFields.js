import React from "react";
import { Typography, Grid, TextField, Box } from "@mui/material";

/**
 * Contact Form Basic Fields Component
 * Name, email, phone, subject, and message fields
 */
function ContactFormFields({
  formData,
  isAuthenticated,
  validationErrors,
  onChange,
}) {
  return (
    <Box component="fieldset" sx={{ border: "none", p: 0, m: 0 }}>
      {/* Contact Information */}
      <Typography
        component="legend"
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Your Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={onChange}
            disabled={isAuthenticated}
            error={!!validationErrors.name}
            helperText={
              validationErrors.name ||
              (isAuthenticated
                ? "Auto-filled from your profile"
                : "Enter your full name")
            }
            inputProps={{ "aria-label": "Your name" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={onChange}
            disabled={isAuthenticated}
            error={!!validationErrors.email}
            helperText={
              validationErrors.email ||
              (isAuthenticated
                ? "Auto-filled from your profile"
                : "We'll respond to this email")
            }
            inputProps={{ "aria-label": "Email address" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Phone Number (Optional)"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
            disabled={isAuthenticated}
            error={!!validationErrors.phoneNumber}
            helperText={validationErrors.phoneNumber || "For urgent matters"}
            inputProps={{ "aria-label": "Phone number" }}
          />
        </Grid>
      </Grid>

      {/* Message Section */}
      <Typography
        component="legend"
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, mt: 3 }}
      >
        Your Message
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={onChange}
            placeholder="Brief summary of your message"
            inputProps={{ maxLength: 200, "aria-label": "Subject" }}
            error={!!validationErrors.subject}
            helperText={
              validationErrors.subject ||
              `${formData.subject.length}/200 characters`
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            multiline
            rows={6}
            label="Message"
            name="message"
            value={formData.message}
            onChange={onChange}
            placeholder="Tell us more about your message..."
            slotProps={{ input: { maxLength: 2000 } }}
            error={!!validationErrors.message}
            helperText={
              validationErrors.message ||
              `${formData.message.length}/2000 characters`
            }
            inputProps={{ "aria-label": "Message content" }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ContactFormFields;
