import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

const AddressPageHeader = () => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        textAlign: { xs: "center", sm: "left" },
      }}
      component="header"
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 1,
          fontSize: { xs: "1.75rem", sm: "2.125rem" },
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
          fontSize: "1rem",
          maxWidth: { xs: "100%", sm: "600px" },
        }}
      >
        Manage your delivery addresses for orders and services. Keep your
        information updated for smooth deliveries.
      </Typography>
    </Box>
  );
};

export default AddressPageHeader;
