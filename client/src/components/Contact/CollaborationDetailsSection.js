import React from "react";
import {
  Typography,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";

const PROPOSAL_TYPES = [
  { value: "partnership", label: "Business Partnership" },
  { value: "sponsorship", label: "Sponsorship" },
  { value: "integration", label: "Technology Integration" },
  { value: "other", label: "Other" },
];

/**
 * Collaboration Details Section Component
 * Collaboration-specific form fields
 */
function CollaborationDetailsSection({ formData, onChange }) {
  return (
    <Box component="fieldset" sx={{ border: "none", p: 0, m: 0 }}>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Collaboration Details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Proposal Type"
            name="proposalType"
            value={formData.proposalType}
            onChange={onChange}
            inputProps={{ "aria-label": "Proposal type" }}
          >
            {PROPOSAL_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Organization Name"
            name="organizationName"
            value={formData.organizationName}
            onChange={onChange}
            placeholder="Your company or organization"
            inputProps={{ "aria-label": "Organization name" }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Website (Optional)"
            name="website"
            value={formData.website}
            onChange={onChange}
            placeholder="https://www.example.com"
            type="url"
            inputProps={{ "aria-label": "Website URL" }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CollaborationDetailsSection;
