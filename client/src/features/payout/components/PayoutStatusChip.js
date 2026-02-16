import React from "react";
import { Chip } from "@mui/material";
import { PAYOUT_STATUS_CONFIG } from "../../../constants/payoutConstant";

/**
 * PayoutStatusChip Component
 *
 * PURPOSE: Display payout status with consistent styling
 */
function PayoutStatusChip({ status, size = "small", sx = {} }) {
  const config = PAYOUT_STATUS_CONFIG[status] || {
    label: status,
    color: "default",
    icon: "❓",
  };

  return (
    <Chip
      label={`${config.icon} ${config.label}`}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 500,
        ...sx,
      }}
      aria-label={`Status: ${config.label}`}
    />
  );
}

export default PayoutStatusChip;
