import {
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import {
  Store as StoreIcon,
  LocalShipping as DeliveryIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const OrderSummary = ({
  sellerGroups = [],
  pricing = {},
  deliveryMethod,
  paymentMethod,
}) => {
  const { theme } = useTheme();

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("ms-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <Paper
      elevation={2}
      component="section"
      aria-labelledby="order-summary-heading"
      sx={{ p: 3 }}
    >
      {/* Header */}
      <Typography
        id="order-summary-heading"
        variant="h6"
        component="h2"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Order Summary
      </Typography>

      {/** Seller Groups */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {sellerGroups.map((group, index) => (
          <Card
            key={group.sellerId}
            variant="outlined"
            component="article"
            aria-label={`Order from ${group.sellerName}`}
            sx={{
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <CardContent>
              {/** Seller Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 32,
                    height: 32,
                  }}
                  aria-hidden="true"
                >
                  <StoreIcon fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    {group.sellerName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {group.items.length} item
                    {group.items.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Chip
                  label={`Seller ${index + 1}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  aria-label={`Seller number ${index + 1}`}
                />
              </Box>

              {/** Item List */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {group.items.map((item) => (
                  <Box
                    key={item.listingId}
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 1.5,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    {/* Item Image */}
                    {item.images?.[0] && (
                      <Avatar
                        src={item.images[0]}
                        alt={item.name}
                        variant="rounded"
                        sx={{
                          width: 56,
                          height: 56,
                        }}
                      />
                    )}

                    {/* Item Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {formatPrice(item.price)} × {item.quantity}
                      </Typography>
                    </Box>

                    {/* Item Total */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        alignSelf: "flex-start",
                        whiteSpace: "nowrap",
                      }}
                      aria-label={`Item subtotal: ${formatPrice(item.itemTotal)}`}
                    >
                      {formatPrice(item.itemTotal)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Seller Pricing Breakdown */}
              <Box
                sx={{
                  pt: 1.5,
                  borderTop: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(group.subtotal)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Delivery Fee
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(group.deliveryFee)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    pt: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Seller Total
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                    aria-label={`Total for ${group.sellerName}: ${formatPrice(group.totalAmount)}`}
                  >
                    {formatPrice(group.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Selected Options Summary */}
      {(deliveryMethod || paymentMethod) && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}
          >
            Selected Options
          </Typography>
          <Stack spacing={1}>
            {deliveryMethod && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DeliveryIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  <strong>Delivery:</strong>{" "}
                  {deliveryMethod
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Typography>
              </Box>
            )}
            {paymentMethod && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaymentIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  <strong>Payment:</strong>{" "}
                  {paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : paymentMethod === "stripe"
                      ? "Credit/Debit Card"
                      : paymentMethod}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/** Grand Total Breakdown */}
      <Box component="dl" sx={{ m: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
          component="div"
        >
          <Typography
            variant="body2"
            component="dt"
            sx={{ color: "text.secondary" }}
          >
            Items Subtotal
          </Typography>
          <Typography variant="body2" component="dd" sx={{ m: 0 }}>
            {formatPrice(pricing.subtotal)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
          component="div"
        >
          <Typography
            variant="body2"
            component="dt"
            sx={{ color: "text.secondary" }}
          >
            Total Delivery Fees
          </Typography>
          <Typography variant="body2" component="dd" sx={{ m: 0 }}>
            {formatPrice(pricing.totalDeliveryFee)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
          component="div"
        >
          <Typography variant="h6" component="dt" sx={{ fontWeight: 700 }}>
            Grand Total
          </Typography>
          <Typography
            variant="h5"
            component="dd"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              m: 0,
            }}
            aria-label={`Grand total: ${formatPrice(pricing.totalAmount)}`}
          >
            {formatPrice(pricing.totalAmount)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderSummary;
