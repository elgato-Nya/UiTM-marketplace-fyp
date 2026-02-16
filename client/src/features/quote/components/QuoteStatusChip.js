import React from "react";
import { Chip } from "@mui/material";
import { QUOTE_STATUS_CONFIG } from "../../../constants/quoteConstant";

/**
 * QuoteStatusChip Component
 *
 * PURPOSE: Display quote status with consistent styling
 * PATTERN: Similar to order status chips
 */
function QuoteStatusChip({ status, size = "small", sx = {} }) {
  const config = QUOTE_STATUS_CONFIG[status] || {
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

export default QuoteStatusChip;
