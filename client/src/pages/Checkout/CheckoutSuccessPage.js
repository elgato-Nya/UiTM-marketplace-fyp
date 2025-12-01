import { useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  ShoppingBag as OrdersIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useTheme } from "../../hooks/useTheme";
import { clearCheckout } from "../../features/checkout/store/checkoutSlice";
import { fetchCart } from "../../features/cart/store/cartSlice";
import { ROUTES } from "../../constants/routes";

const CheckoutSuccessPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { orders } = location.state || {};

  useEffect(() => {
    // Clear checkout session
    dispatch(clearCheckout());

    // Refresh cart (should be empty now)
    dispatch(fetchCart());
  }, [dispatch]);

  // Redirect if no orders data
  useEffect(() => {
    if (!orders || orders.length === 0) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [orders, navigate]);

  if (!orders || orders.length === 0) {
    return null;
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={3}>
        <CardContent>
          {/* Success Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <SuccessIcon
              sx={{
                fontSize: 80,
                color: "success.main",
              }}
              aria-hidden="true"
            />
          </Box>

          {/* Success Message */}
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Order Confirmed!
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Thank you for your purchase. Your order has been successfully
            placed.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Order Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ReceiptIcon aria-hidden="true" />
              Order Summary
            </Typography>

            <List>
              {orders.map((order, index) => (
                <ListItem
                  key={order._id}
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, flexGrow: 1 }}
                    >
                      Order #{index + 1}
                    </Typography>
                    <Chip label={order.status} size="small" color="primary" />
                  </Box>

                  <ListItemText
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Order ID: {order._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seller: {order.seller?.username || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Items: {order.items.length}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, mt: 1 }}
                        >
                          Total: RM {order.totalAmount.toFixed(2)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "primary.light",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h6"
                align="right"
                sx={{ fontWeight: 600, color: "primary.contrastText" }}
              >
                Grand Total: RM {totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Next Steps */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will receive an email confirmation shortly. You can track your
            orders in the Orders section.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              component={Link}
              to={ROUTES.ORDERS.PURCHASES}
              variant="contained"
              startIcon={<OrdersIcon />}
              sx={{ textDecoration: "none" }}
              fullWidth={{ xs: true, sm: false }}
            >
              View Orders
            </Button>
            <Button
              component={Link}
              to={ROUTES.HOME}
              variant="outlined"
              startIcon={<HomeIcon />}
              sx={{ textDecoration: "none" }}
              fullWidth={{ xs: true, sm: false }}
            >
              Continue Shopping
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutSuccessPage;
