import React from "react";
import { Chip } from "@mui/material";
import {
  HourglassEmpty,
  CheckCircle,
  LocalShipping,
  Cancel,
  ThumbUp,
} from "@mui/icons-material";

import { STATUS_CONFIG } from "../../../constants/orderConstant";
import { getStatusColor } from "../utils/orderHelper";

function OrderStatusBadge({ status, size = "medium", showIcon = true }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: "📋",
    description: "Order status",
  };

  const color = getStatusColor(status);

  const icons = {
    pending: <HourglassEmpty fontSize="small" style={{ color }} />,
    confirmed: <CheckCircle fontSize="small" style={{ color }} />,
    processing: <CheckCircle fontSize="small" style={{ color }} />,
    shipped: <LocalShipping fontSize="small" style={{ color }} />,
    delivered: <ThumbUp fontSize="small" style={{ color }} />,
    completed: <ThumbUp fontSize="small" style={{ color }} />,
    cancelled: <Cancel fontSize="small" style={{ color }} />,
    refunded: <Cancel fontSize="small" style={{ color }} />,
  };

  return (
    <Chip
      label={config.label}
      color={color}
      size={size}
      icon={showIcon ? icons[status] : undefined}
      role="status"
      aria-label={`Order status: ${config.label}. ${config.description}`}
      sx={{
        fontWeight: 500,
        "& .MuiChip-icon": {
          marginLeft: 1,
        },
      }}
    />
  );
}

export default OrderStatusBadge;
