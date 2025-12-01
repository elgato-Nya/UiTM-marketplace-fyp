import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import { Person } from "@mui/icons-material";

/**
 * OrderPartyInfoCard Component
 *
 * Displays buyer or seller information
 */
function OrderPartyInfoCard({ party, partyType = "Seller" }) {
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
        <Person sx={{ mr: 1, color: "primary.main" }} aria-hidden="true" />
        <Typography variant="h6" fontWeight={600}>
          {partyType} Information
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
          Name
        </Typography>
        <Typography component="dd" variant="body1" sx={{ mb: 1.5, ml: 0 }}>
          {party?.name || party?.username}
        </Typography>
        <Typography
          component="dt"
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          Email
        </Typography>
        <Typography component="dd" variant="body1" sx={{ ml: 0 }}>
          {party?.email}
        </Typography>
      </Box>
    </Paper>
  );
}

export default OrderPartyInfoCard;
