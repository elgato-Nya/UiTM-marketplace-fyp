import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import OrderTimeline from "../OrderTimeline";

/**
 * OrderTimelineSection Component
 *
 * Displays order status timeline
 */
function OrderTimelineSection({ statusHistory, currentStatus }) {
  if (!statusHistory || statusHistory.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mt: 3,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Order Timeline
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <OrderTimeline
        statusHistory={statusHistory}
        currentStatus={currentStatus}
        orientation="vertical"
      />
    </Paper>
  );
}

export default OrderTimelineSection;
