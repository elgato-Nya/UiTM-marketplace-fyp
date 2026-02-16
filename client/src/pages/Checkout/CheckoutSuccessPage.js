import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  ShoppingBag as OrdersIcon,
} from "@mui/icons-material";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { useStripe } from "@stripe/react-stripe-js";

import { useTheme } from "../../hooks/useTheme";
import {
  clearCheckout,
  confirmCheckout,
} from "../../features/checkout/store/checkoutSlice";
import { fetchCart } from "../../features/cart/store/cartSlice";
import { ROUTES } from "../../constants/routes";

const CheckoutSuccessPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState(location.state?.orders || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Handle redirect from GrabPay/Stripe
  useEffect(() => {
    const handleStripeRedirect = async () => {
      const paymentIntentClientSecret = searchParams.get(
        "payment_intent_client_secret",
      );
      const sessionId = searchParams.get("session_id");

      if (paymentIntentClientSecret && sessionId && stripe && !orders) {
        setIsProcessing(true);
        try {
          // Verify payment status with Stripe
          const { paymentIntent } = await stripe.retrievePaymentIntent(
            paymentIntentClientSecret,
          );

          if (paymentIntent.status === "succeeded") {
            // Payment successful, confirm checkout to create orders
            const result = await dispatch(confirmCheckout(sessionId)).unwrap();
            setOrders(result.orders);
          } else {
            setError(`Payment ${paymentIntent.status}. Please try again.`);
          }
        } catch (err) {
          console.error("Error processing redirect:", err);
          setError(err.message || "Failed to process payment");
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleStripeRedirect();
  }, [stripe, searchParams, dispatch, orders]);

  useEffect(() => {
    if (orders) {
      // Clear checkout session
      dispatch(clearCheckout());
      // Refresh cart (should be empty now)
      dispatch(fetchCart());
    }
  }, [dispatch, orders]);

  // Redirect if no orders data and not processing
  useEffect(() => {
    if (
      !orders &&
      !isProcessing &&
      !searchParams.get("payment_intent_client_secret")
    ) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [orders, navigate, isProcessing, searchParams]);

  // Show loading while processing redirect payment
  if (isProcessing) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5">Processing your payment...</Typography>
            <Typography color="text.secondary">
              Please wait while we confirm your order.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Show error if payment failed
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h5" color="error.main" gutterBottom>
              Payment Failed
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button variant="contained" component={Link} to={ROUTES.CART}>
              Return to Cart
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

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
                      <Box component="div">
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          Order ID: {order._id}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          Seller:{" "}
                          {order.seller?.name ||
                            order.seller?.username ||
                            "Unknown"}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          Items: {order.items.length}
                        </Typography>
                        <Typography
                          variant="body1"
                          component="div"
                          sx={{ fontWeight: 600, mt: 1 }}
                        >
                          Total: RM {order.totalAmount.toFixed(2)}
                        </Typography>
                      </Box>
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
              sx={{
                textDecoration: "none",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              View Orders
            </Button>
            <Button
              component={Link}
              to={ROUTES.HOME}
              variant="outlined"
              startIcon={<HomeIcon />}
              sx={{
                textDecoration: "none",
                width: { xs: "100%", sm: "auto" },
              }}
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
