import React from "react";
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { ChevronRight, AccessTime } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { formatDistanceToNow } from "date-fns";
import QuoteStatusChip from "./QuoteStatusChip";
import { QUOTE_PRIORITY_CONFIG } from "../../../constants/quoteConstant";

/**
 * QuoteListItem Component
 *
 * PURPOSE: Display quote information in a list format
 * PATTERN: Similar to OrderListItem
 */
function QuoteListItem({ quote, role = "buyer", onViewDetails }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!quote) return null;

  // Access the correct data structure from the quote model
  const listing = quote.listing || {};
  const request = quote.request || {};
  const isBuyer = role === "buyer";
  const priorityConfig = QUOTE_PRIORITY_CONFIG[request.priority || "normal"];

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(quote);
    }
  };

  // Format currency
  const formatPrice = (amount) => {
    if (!amount) return "-";
    return `RM ${amount.toFixed(2)}`;
  };

  // Get counterparty name - use denormalized data from quote
  const counterpartyName = isBuyer
    ? quote.seller?.shopName || quote.seller?.username || "Seller"
    : quote.buyer?.username || "Customer";

  return (
    <ListItem
      component="article"
      disablePadding
      aria-label={`Quote request for ${listing?.name || "service"}`}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        "&:last-child": { borderBottom: 0 },
      }}
    >
      <ListItemButton
        onClick={handleClick}
        sx={{
          py: 2,
          px: { xs: 2, sm: 3 },
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {/* Listing Image */}
        <Avatar
          variant="rounded"
          src={listing?.image}
          alt={listing?.name}
          sx={{
            width: { xs: 48, sm: 64 },
            height: { xs: 48, sm: 64 },
            mr: 2,
            bgcolor: "grey.200",
          }}
        >
          {listing?.name?.charAt(0) || "S"}
        </Avatar>

        {/* Content */}
        <ListItemText
          primary={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 0.5,
              }}
            >
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: 600 }}
              >
                {listing?.name || "Service"}
              </Typography>
              <QuoteStatusChip status={quote.status} />
              {priorityConfig && request.priority !== "normal" && (
                <Chip
                  label={priorityConfig.icon + " " + priorityConfig.label}
                  size="small"
                  color={priorityConfig.color}
                  sx={{ height: 24 }}
                />
              )}
            </Box>
          }
          secondary={
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {/* Counterparty */}
              <Typography variant="body2" color="text.secondary">
                {isBuyer ? "Seller: " : "Customer: "}
                <Typography component="span" color="text.primary">
                  {counterpartyName}
                </Typography>
              </Typography>

              {/* Price info */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {request.budget && (
                  <Typography variant="body2" color="text.secondary">
                    Budget:{" "}
                    <Typography component="span" color="text.primary">
                      {formatPrice(request.budget)}
                    </Typography>
                  </Typography>
                )}
                {quote.sellerQuote?.quotedPrice && (
                  <Typography variant="body2" color="text.secondary">
                    Quoted:{" "}
                    <Typography
                      component="span"
                      color="primary.main"
                      fontWeight={600}
                    >
                      {formatPrice(quote.sellerQuote.quotedPrice)}
                    </Typography>
                  </Typography>
                )}
              </Box>

              {/* Time */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <AccessTime sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {formatDistanceToNow(new Date(quote.createdAt), {
                    addSuffix: true,
                  })}
                </Typography>
              </Box>
            </Stack>
          }
          secondaryTypographyProps={{ component: "div" }}
        />

        {/* Chevron */}
        {!isMobile && <ChevronRight sx={{ color: "text.secondary", ml: 1 }} />}
      </ListItemButton>
    </ListItem>
  );
}

export default QuoteListItem;
