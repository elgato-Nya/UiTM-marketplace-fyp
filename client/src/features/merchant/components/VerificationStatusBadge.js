import React from "react";
import { Chip } from "@mui/material";
import { VerifiedUser, HourglassEmpty, Cancel } from "@mui/icons-material";

/**
 * VerificationStatusBadge Component
 *
 * PURPOSE: Display merchant verification status as a badge
 * USAGE: Shop profiles, merchant dashboard, listings
 */

function VerificationStatusBadge({
  isVerified,
  size = "small",
  showIcon = true,
}) {
  if (isVerified) {
    return (
      <Chip
        icon={showIcon ? <VerifiedUser /> : undefined}
        label="UiTM Verified"
        color="success"
        size={size}
        sx={{ fontWeight: 600 }}
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
