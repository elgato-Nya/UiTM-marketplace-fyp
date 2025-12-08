import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  ShoppingBag,
  Storefront,
  AddCircleOutline,
  FilterListOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function EmptyOrderState({
  role = "buyer",
  orderRole,
  hasFilters = false,
  onReset,
}) {
  const navigate = useNavigate();

  // Support both role and orderRole props for backward compatibility
  const userRole = role || orderRole || "buyer";
  const isBuyer = userRole === "buyer";

  const handleAction = () => {
    if (isBuyer) {
      navigate("/listings");
    } else {
      navigate("/merchant/listings/create");
    }
  };

  const handleResetFilters = () => {
    if (onReset) {
      onReset();
    }
  };

  // Different messages for filtered vs empty state
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
        aria-label="No orders found message"
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
          No Orders Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: 3 }}
        >
          No orders match your current filters. Try adjusting your search
          criteria.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleResetFilters}
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
      aria-label="Empty orders message"
    >
      {isBuyer ? (
        <ShoppingBag
          sx={{
            fontSize: { xs: 60, sm: 80 },
            color: "primary.main",
            opacity: 0.7,
            mb: 2,
          }}
          aria-hidden="true"
        />
      ) : (
        <Storefront
          sx={{
            fontSize: { xs: 60, sm: 80 },
            color: "primary.main",
            opacity: 0.7,
            mb: 2,
          }}
          aria-hidden="true"
        />
      )}

      <Typography
        variant="h5"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {isBuyer ? "No Orders Yet" : "No Sales Yet"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 450, mb: 1 }}
      >
        {isBuyer
          ? "You haven't placed any orders yet."
          : "You haven't received any orders yet."}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 450, mb: 4 }}
      >
        {isBuyer
          ? "Discover amazing products from our merchants and start shopping today!"
          : "Start selling by creating your first listing. Share your products with customers and watch your business grow!"}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleAction}
        startIcon={isBuyer ? <ShoppingBag /> : <AddCircleOutline />}
        sx={{
          px: 4,
          py: 1.5,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "1rem",
        }}
      >
        {isBuyer ? "Browse Listings" : "Create Your First Listing"}
      </Button>
    </Paper>
  );
}

export default EmptyOrderState;
