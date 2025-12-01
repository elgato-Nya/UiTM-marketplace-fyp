import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ShoppingBag, Storefront } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function EmptyOrderState({ orderRole = "buyer" }) {
  const navigate = useNavigate();

  const isBuyer = orderRole === "buyer";

  const handleAction = () => {
    if (isBuyer) {
      navigate("/listings");
    } else {
      // todo: recheck the navigation path for seller
      navigate("/merchant/listings");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        py: 8,
        px: 3,
      }}
      role="region"
      aria-label="Empty orders message"
    >
      {isBuyer ? (
        <ShoppingBag
          sx={{
            fontSize: 80,
            color: "text.secondary",
            opacity: 0.5,
            mb: 2,
          }}
          aria-hidden="true"
        />
      ) : (
        <Storefront
          sx={{
            fontSize: 80,
            color: "text.secondary",
            opacity: 0.5,
            mb: 2,
          }}
          aria-hidden="true"
        />
      )}

      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {isBuyer ? "You have no orders yet." : "No orders received yet."}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        component="p"
        sx={{ maxWidth: 400, mb: 3 }}
      >
        {isBuyer
          ? "Browse listings and make your first purchase!"
          : "Share your store and get your first order!"}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAction}
        startIcon={isBuyer ? <ShoppingBag /> : <Storefront />}
        aria-label={
          isBuyer
            ? "Browse listings to start shopping"
            : "Go to your store management page"
        }
      ></Button>
    </Box>
  );
}

export default EmptyOrderState;
