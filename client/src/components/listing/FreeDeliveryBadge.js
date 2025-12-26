import React from "react";
import { Chip, Box, Typography, useMediaQuery } from "@mui/material";
import { LocalOffer } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * FreeDeliveryBadge Component
 *
 * PURPOSE: Display free delivery threshold information
 * LOCATION: Used in DeliveryFeeDisplay component
 * FEATURES:
 *  - Shows free delivery threshold amount
 *  - Eye-catching badge design
 *  - Responsive sizing
 *  - Accessible label
 *
 * USAGE:
 *  <FreeDeliveryBadge threshold={50} />
 */
function FreeDeliveryBadge({ threshold }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!threshold || threshold <= 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        backgroundColor: theme.palette.success.light + "20",
        border: `2px solid ${theme.palette.success.main}`,
        borderRadius: 2,
        mb: 2,
      }}
      role="status"
      aria-label={`Free delivery for orders above RM ${threshold}`}
    >
      <LocalOffer
        sx={{
          fontSize: isMobile ? 20 : 24,
          color: theme.palette.success.main,
        }}
      />
      <Box>
        <Typography
          variant={isMobile ? "body2" : "body1"}
          sx={{
            fontWeight: 700,
            color: theme.palette.success.dark,
            lineHeight: 1.2,
          }}
        >
          Free Delivery
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: "block",
            lineHeight: 1.2,
          }}
        >
          For orders ≥ RM {threshold.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}

export default FreeDeliveryBadge;
