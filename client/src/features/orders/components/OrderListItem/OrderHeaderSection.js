import React from "react";
import { Box, Typography } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import OrderStatusBadge from "../OrderStatusBadge";
import { formatRelativeTime, formatOrderDate } from "../../utils/orderHelper";

/**
 * OrderHeaderSection Component
 *
 * Displays order number, date, and status badge
 */
function OrderHeaderSection({ order, isMobile }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: {
              xs: "0.95rem",
              sm: "1.05rem",
              md: "1.15rem",
            },
            mb: 0.5,
            wordBreak: "break-word",
          }}
        >
          {order.orderNumber}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
          }}
        >
          <CalendarToday sx={{ fontSize: 12 }} aria-hidden="true" />
          <time dateTime={order.createdAt}>
            {isMobile
              ? formatRelativeTime(order.createdAt)
              : formatOrderDate(order.createdAt, "dd MMM yyyy, h:mm a")}
          </time>
        </Typography>
      </Box>
      <OrderStatusBadge status={order.status} size="small" />
    </Box>
  );
}

export default OrderHeaderSection;
