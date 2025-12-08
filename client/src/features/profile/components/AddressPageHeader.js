import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

const AddressPageHeader = () => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        mb: { xs: 3, sm: 4 },
        textAlign: { xs: "center", sm: "left" },
      }}
      component="header"
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: { xs: 0.75, sm: 1 },
          fontSize: { xs: "1.5rem", sm: "2.125rem" },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        id="page-title"
      >
        My Addresses
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        aria-describedby="page-title"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
          maxWidth: { xs: "100%", sm: "600px" },
          lineHeight: { xs: 1.5, sm: 1.6 },
        }}
      >
        Manage your delivery addresses for orders and services. Keep your
        information updated for smooth deliveries.
      </Typography>
    </Box>
  );
};

export default AddressPageHeader;
