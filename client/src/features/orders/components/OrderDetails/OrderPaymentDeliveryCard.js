import React from "react";
import { Box, Typography, Divider, Paper, Chip } from "@mui/material";
import { Payment } from "@mui/icons-material";
import {
  getDeliveryMethodLabel,
  getPaymentMethodLabel,
} from "../../utils/orderHelper";

/**
 * OrderPaymentDeliveryCard Component
 *
 * Displays payment and delivery information
 */
function OrderPaymentDeliveryCard({ order }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Payment sx={{ mr: 1, color: "primary.main" }} aria-hidden="true" />
        <Typography variant="h6" fontWeight={600}>
          Payment & Delivery
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box component="dl" sx={{ m: 0 }}>
        <Typography
          component="dt"
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          Payment Method
        </Typography>
        <Typography component="dd" variant="body1" sx={{ mb: 1.5, ml: 0 }}>
          {getPaymentMethodLabel(order.paymentMethod)}
        </Typography>

        <Typography
          component="dt"
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          Payment Status
        </Typography>
        <Box component="dd" sx={{ mb: 1.5, ml: 0 }}>
          <Chip
            label={order.paymentStatus}
            size="small"
            color={order.paymentStatus === "paid" ? "success" : "warning"}
            sx={{ textTransform: "capitalize" }}
          />
        </Box>

        <Typography
          component="dt"
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          Delivery Method
        </Typography>
        <Typography component="dd" variant="body1" sx={{ mb: 1.5, ml: 0 }}>
          {getDeliveryMethodLabel(order.deliveryMethod)}
        </Typography>

        {order.trackingNumber && (
          <>
            <Typography
              component="dt"
              variant="body2"
              color="text.secondary"
              fontWeight={500}
            >
              Tracking Number
            </Typography>
            <Typography
              component="dd"
              variant="body1"
              sx={{ ml: 0, fontFamily: "monospace" }}
            >
              {order.trackingNumber}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default OrderPaymentDeliveryCard;
