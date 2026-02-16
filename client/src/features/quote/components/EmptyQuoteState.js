import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { QuestionAnswer, FilterListOff, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

/**
 * EmptyQuoteState Component
 *
 * PURPOSE: Display empty state for quote lists
 * PATTERN: Similar to EmptyOrderState
 */
function EmptyQuoteState({ role = "buyer", hasFilters = false, onReset }) {
  const navigate = useNavigate();
  const isBuyer = role === "buyer";

  const handleAction = () => {
    navigate(ROUTES.BROWSE + "?type=service");
  };

  if (hasFilters) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: { xs: 6, sm: 8 },
          px: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
        role="region"
        aria-label="No quotes found message"
      >
        <FilterListOff
          sx={{
            fontSize: { xs: 60, sm: 80 },
            color: "text.secondary",
            opacity: 0.5,
            mb: 2,
          }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          No Quotes Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: 3 }}
        >
          No quotes match your current filters. Try adjusting your search
          criteria.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={onReset}
          startIcon={<FilterListOff />}
        >
          Clear Filters
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        py: { xs: 6, sm: 8 },
        px: 3,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
      role="region"
      aria-label="Empty quotes message"
    >
      <QuestionAnswer
        sx={{
          fontSize: { xs: 60, sm: 80 },
          color: "primary.main",
          opacity: 0.7,
          mb: 2,
        }}
        aria-hidden="true"
      />

      <Typography
        variant="h5"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {isBuyer ? "No Quote Requests Yet" : "No Quote Requests"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 450, mb: 3 }}
      >
        {isBuyer
          ? "You haven't requested any quotes for services yet. Browse our service listings to get started."
          : "You haven't received any quote requests yet. Make sure your service listings are visible to attract customers."}
      </Typography>

      {isBuyer && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleAction}
          startIcon={<Add />}
          size="large"
        >
          Browse Services
        </Button>
      )}
    </Paper>
  );
}

export default EmptyQuoteState;
