import React from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import {
  BugReport,
  HelpOutline,
  Feedback,
  Handshake,
} from "@mui/icons-material";

/**
 * Contact Type Selector Component
 *
 * PURPOSE: Allow users to select their contact submission type
 * PROPS:
 * - selectedType: Current selected type
 * - onTypeChange: Callback when type changes
 * - types: Array of submission type objects
 */

export const SUBMISSION_TYPES = [
  {
    value: "bug_report",
    label: "Bug Report",
    icon: <BugReport />,
    description: "Report technical issues or bugs",
    color: "error",
  },
  {
    value: "enquiry",
    label: "General Enquiry",
    icon: <HelpOutline />,
    description: "Ask questions about the platform",
    color: "primary",
  },
  {
    value: "feedback",
    label: "Feedback",
    icon: <Feedback />,
    description: "Share your thoughts and suggestions",
    color: "success",
  },
  {
    value: "collaboration",
    label: "Collaboration Request",
    icon: <Handshake />,
    description: "Propose partnerships or collaborations",
    color: "warning",
  },
];

function ContactTypeSelector({ selectedType, onTypeChange }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        What would you like to do?
      </Typography>
      <Grid container spacing={2}>
        {SUBMISSION_TYPES.map((type) => (
          <Grid size={{ xs: 6, sm: 3 }} key={type.value}>
            <Paper
              onClick={() => onTypeChange(type.value)}
              sx={{
                p: 2,
                cursor: "pointer",
                border: 2,
                borderColor:
                  selectedType === type.value
                    ? `${type.color}.main`
                    : "transparent",
                bgcolor:
                  selectedType === type.value
                    ? `${type.color}.lighter`
                    : "background.paper",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: `${type.color}.main`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box sx={{ color: `${type.color}.main` }}>{type.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {type.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ContactTypeSelector;
