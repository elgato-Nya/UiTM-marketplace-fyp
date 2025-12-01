import React from "react";
import { Box, Typography, Divider, Avatar, Stack, Paper } from "@mui/material";
import { ShoppingBag } from "@mui/icons-material";
import { formatCurrency } from "../../utils/orderHelper";

/**
 * OrderItemsSection Component
 *
 * Displays the list of items in an order
 */
function OrderItemsSection({ items = [] }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ShoppingBag sx={{ mr: 1, color: "primary.main" }} aria-hidden="true" />
        <Typography variant="h6" fontWeight={600}>
          Order Items ({items.length})
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2} divider={<Divider />}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            {/* Product Image */}
            <Avatar
              src={item.images?.[0]}
              alt={item.name}
              variant="rounded"
              sx={{
                width: { xs: "100%", sm: 80 },
                height: { xs: 200, sm: 80 },
                bgcolor: "grey.200",
              }}
            />

            {/* Product Details */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ wordBreak: "break-word" }}
              >
                {item.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Quantity: {item.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unit Price: {formatCurrency(item.price)}
              </Typography>
            </Box>

            {/* Item Total */}
            <Box
              sx={{
                textAlign: { xs: "left", sm: "right" },
                minWidth: { sm: 100 },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {formatCurrency(item.price * item.quantity)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default OrderItemsSection;
