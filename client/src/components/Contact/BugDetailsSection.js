import React from "react";
import {
  Typography,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";
import ImageUploadField from "./ImageUploadField";

const BUG_SEVERITIES = [
  { value: "low", label: "Low - Minor issue" },
  { value: "medium", label: "Medium - Affects functionality" },
  { value: "high", label: "High - Major issue" },
  { value: "critical", label: "Critical - Platform unusable" },
];

const DEVICE_TYPES = [
  { value: "desktop", label: "Desktop/Laptop" },
  { value: "mobile", label: "Mobile Phone" },
  { value: "tablet", label: "Tablet" },
];

/**
 * Bug Details Section Component
 * Bug-specific form fields and image upload
 */
function BugDetailsSection({
  formData,
  images,
  isSubmitting,
  onChange,
  onImagesChange,
  validationErrors = {},
}) {
  return (
    <Box component="fieldset" sx={{ border: "none", p: 0, m: 0 }}>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Bug Details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            select
            label="Severity"
            name="bugSeverity"
            value={formData.bugSeverity}
            onChange={onChange}
            error={!!validationErrors.bugSeverity}
            helperText={
              validationErrors.bugSeverity || "How severe is this bug?"
            }
            inputProps={{ "aria-label": "Bug severity" }}
          >
            {BUG_SEVERITIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            select
            label="Device Type"
            name="deviceType"
            value={formData.deviceType}
            onChange={onChange}
            error={!!validationErrors.deviceType}
            helperText={
              validationErrors.deviceType || "Which device did you use?"
            }
            inputProps={{ "aria-label": "Device type" }}
          >
            {DEVICE_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Browser (Optional)"
            name="browser"
            value={formData.browser}
            onChange={onChange}
            placeholder="e.g., Chrome 120, Safari 17"
            error={!!validationErrors.browser}
            helperText={
              validationErrors.browser || "Which browser are you using?"
            }
            inputProps={{ "aria-label": "Browser information" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Expected Behavior"
            name="expectedBehavior"
            value={formData.expectedBehavior}
            onChange={onChange}
            placeholder="What should happen?"
            slotProps={{ input: { maxLength: 500 } }}
            error={!!validationErrors.expectedBehavior}
            helperText={
              validationErrors.expectedBehavior ||
              `Describe what you expected to happen (${formData.expectedBehavior?.length || 0}/500)`
            }
            inputProps={{ "aria-label": "Expected behavior description" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Actual Behavior"
            name="actualBehavior"
            value={formData.actualBehavior}
            onChange={onChange}
            placeholder="What actually happens?"
            slotProps={{ input: { maxLength: 500 } }}
            error={!!validationErrors.actualBehavior}
            helperText={
              validationErrors.actualBehavior ||
              `Describe what actually happened (${formData.actualBehavior?.length || 0}/500)`
            }
            inputProps={{ "aria-label": "Actual behavior description" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Steps to Reproduce (Optional)"
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={onChange}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
            slotProps={{ input: { maxLength: 1000 } }}
            error={!!validationErrors.stepsToReproduce}
            helperText={
              validationErrors.stepsToReproduce ||
              `Optional: List the steps to reproduce the bug (${formData.stepsToReproduce?.length || 0}/1000)`
            }
            inputProps={{ "aria-label": "Steps to reproduce" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ImageUploadField
            images={images}
            onChange={onImagesChange}
            maxImages={5}
            label="Screenshots (Optional)"
            helperText="Upload screenshots to help us understand the bug"
            disabled={isSubmitting}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BugDetailsSection;
