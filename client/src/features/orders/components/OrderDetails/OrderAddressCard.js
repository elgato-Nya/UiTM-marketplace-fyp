import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

/**
 * OrderAddressCard Component
 *
 * Displays delivery address information
 */
function OrderAddressCard({ address }) {
  if (!address) return null;

  const isCampusAddress = address.type === "campus";
  const isPersonalAddress = address.type === "personal";

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
        <LocationOn sx={{ mr: 1, color: "primary.main" }} aria-hidden="true" />
        <Typography variant="h6" fontWeight={600}>
          Delivery Address
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box component="address" sx={{ fontStyle: "normal" }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {address.recipientName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Phone: {address.recipientPhone}
        </Typography>

        {isCampusAddress && address.campusAddress && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 1 }}
            >
              Campus: {address.campusAddress.campus}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {address.campusAddress.building}, Floor{" "}
              {address.campusAddress.floor}, Room {address.campusAddress.room}
            </Typography>
          </>
        )}

        {isPersonalAddress && address.personalAddress && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 1 }}
            >
              {address.personalAddress.addressLine1}
            </Typography>
            {address.personalAddress.addressLine2 && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {address.personalAddress.addressLine2}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {address.personalAddress.city}, {address.personalAddress.state}{" "}
              {address.personalAddress.postcode}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default OrderAddressCard;
