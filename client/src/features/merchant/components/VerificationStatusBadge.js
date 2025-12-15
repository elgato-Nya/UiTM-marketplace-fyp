import React from "react";
import { Chip } from "@mui/material";
import { VerifiedUser, HourglassEmpty } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * VerificationStatusBadge Component
 *
 * PURPOSE: Display merchant verification status as a badge with UiTM Gold accent
 * USAGE: Shop profiles, merchant dashboard, listings
 */

function VerificationStatusBadge({
  isVerified,
  size = "small",
  showIcon = true,
}) {
  const { theme } = useTheme();

  if (isVerified) {
    return (
      <Chip
        icon={showIcon ? <VerifiedUser /> : undefined}
        label="UiTM Verified"
        size={size}
        sx={{
          bgcolor: "accent.main",
          color: "accent.contrastText",
          fontWeight: 600,
          "& .MuiChip-icon": {
            color: "accent.contrastText",
          },
        }}
      />
    );
  }

  return (
    <Chip
      icon={showIcon ? <HourglassEmpty /> : undefined}
      label="Unverified"
      color="default"
      size={size}
      variant="outlined"
    />
  );
}

export default VerificationStatusBadge;
