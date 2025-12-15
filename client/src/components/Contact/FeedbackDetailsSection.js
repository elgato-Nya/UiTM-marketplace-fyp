import React from "react";
import { Typography, Grid, Box, Rating } from "@mui/material";
import { Star } from "@mui/icons-material";

/**
 * Feedback Details Section Component
 * Rating and optional screenshots for feedback submissions
 */
function FeedbackDetailsSection({ formData, onChange, validationErrors }) {
  const handleRatingChange = (event, newValue) => {
    onChange({
      target: {
        name: "feedbackRating",
        value: newValue,
      },
    });
  };

  return (
    <Box component="fieldset" sx={{ border: "none", p: 0, m: 0, mt: 3 }}>
      <Typography
        component="legend"
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Rate Your Experience
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: (theme) =>
                validationErrors.feedbackRating
                  ? `1px solid ${theme.palette.error.main}`
                  : `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body1" sx={{ minWidth: 160 }}>
              Overall Rating:
            </Typography>
            <Rating
              name="feedbackRating"
              value={formData.feedbackRating || 0}
              onChange={handleRatingChange}
              size="large"
              emptyIcon={<Star style={{ opacity: 0.3, fontSize: "inherit" }} />}
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "warning.main",
                },
                "& .MuiRating-iconHover": {
                  color: "warning.light",
                },
              }}
            />
            {formData.feedbackRating > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({formData.feedbackRating}{" "}
                {formData.feedbackRating === 1 ? "star" : "stars"})
              </Typography>
            )}
          </Box>
          {validationErrors.feedbackRating && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5, ml: 1.75 }}
            >
              {validationErrors.feedbackRating}
            </Typography>
          )}
          {!validationErrors.feedbackRating && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, ml: 1.75, display: "block" }}
            >
              {formData.feedbackRating
                ? "Thank you for your rating!"
                : "Please rate your experience from 1 to 5 stars"}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default FeedbackDetailsSection;
