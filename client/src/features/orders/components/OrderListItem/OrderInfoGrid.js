import { Box, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import { formatCurrency } from "../../utils/orderHelper";

/**
 * OrderInfoGrid Component
 *
 * Displays essential order information in a compact layout
 * Shows: Listing name, Price, Total Payment, Seller (for buyer)
 */
function OrderInfoGrid({ order, orderRole }) {
  const isBuyer = orderRole === "buyer";
  const otherParty = isBuyer ? order.seller : order.buyer;
  const firstItem = order.items?.[0];
  const itemCount = order.items?.length || 0;
  const additionalItems = itemCount - 1;

  // Calculate item price (first item)
  const itemPrice = firstItem?.price || 0;
  const itemQuantity = firstItem?.quantity || 1;
  const subtotal = itemPrice * itemQuantity;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1,
      }}
    >
      {/* Listing Name */}
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.95rem", sm: "1rem" },
            lineHeight: 1.3,
            mb: 0.25,
          }}
        >
          {firstItem?.name}
          {additionalItems > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 0.5,
                color: "text.secondary",
                fontWeight: 400,
              }}
            >
              +{additionalItems} more
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Compact Info Row: Price | Total Payment */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Item Price */}
        <Box sx={{ flex: "0 0 auto" }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.7rem",
              mb: 0.25,
            }}
          >
            Price
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {formatCurrency(subtotal)}
          </Typography>
        </Box>

        {/* Total Payment */}
        <Box sx={{ flex: "0 0 auto" }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.7rem",
              mb: 0.25,
            }}
          >
            Total Payment
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: { xs: "0.95rem", sm: "1rem" },
            }}
          >
            {formatCurrency(order.totalAmount)}
          </Typography>
        </Box>

        {/* Seller Name (for buyers) */}
        {isBuyer && (
          <Box sx={{ flex: "0 0 auto" }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontSize: "0.7rem",
                mb: 0.25,
              }}
            >
              <Person
                sx={{ fontSize: 12, verticalAlign: "middle", mr: 0.25 }}
              />
              Seller
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {otherParty?.name || otherParty?.username}
            </Typography>
          </Box>
        )}

        {/* Buyer Name (for sellers) */}
        {!isBuyer && (
          <Box sx={{ flex: "0 0 auto" }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontSize: "0.7rem",
                mb: 0.25,
              }}
            >
              <Person
                sx={{ fontSize: 12, verticalAlign: "middle", mr: 0.25 }}
              />
              Buyer
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {otherParty?.username}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default OrderInfoGrid;
