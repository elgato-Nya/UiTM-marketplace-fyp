import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

import { useTheme } from "../../../hooks/useTheme";

const CartSummary = ({
  summary,
  onCheckout,
  hasUnavailableItems = false,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const {
    totalItems = 0,
    totalItemsQuantity = 0,
    totalPrice = 0,
  } = summary || {};

  const canCheckout = totalItems > 0 && !hasUnavailableItems;

  return (
    <Card
      sx={{
        position: { xs: "relative", md: "sticky" },
        top: { md: 16 },
        height: "fit-content",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: theme.palette.text.primary,
          }}
        >
          Cart Summary
        </Typography>
        {/** Summary Details */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Items ({totalItems})
            </Typography>
            <Typography variant="body2">{totalItemsQuantity} units</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2">RM{totalPrice.toFixed(2)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/** Total */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            RM{totalPrice.toFixed(2)}
          </Typography>
        </Box>

        {/* Checkout Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={onCheckout}
          disabled={!canCheckout || isLoading}
          sx={{
            py: 1.5,
            fontWeight: 600,
          }}
        >
          {hasUnavailableItems
            ? "Remove Unavailable Items"
            : "Proceed to Checkout"}
        </Button>

        {/* Info Text */}
        {hasUnavailableItems && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 1,
            }}
          >
            Please remove unavailable items to continue
          </Typography>
        )}

        {!hasUnavailableItems && totalItems > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 1,
            }}
          >
            Shipping calculated at checkout
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
