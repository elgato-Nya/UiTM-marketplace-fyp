import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
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

import {
  clearCheckout,
  confirmCheckout,
} from "../../features/checkout/store/checkoutSlice";
import { checkoutService } from "../../features/checkout/service/checkoutService";
import orderService from "../../features/orders/service/orderService";
import { fetchCart } from "../../features/cart/store/cartSlice";
import { ROUTES } from "../../constants/routes";

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState(() => {
    if (location.state?.orders) return location.state.orders;
    try {
      const cached = sessionStorage.getItem("checkout_last_orders");
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHydratingOrders, setIsHydratingOrders] = useState(false);
  const [error, setError] = useState(null);

  const isOrderIncomplete = (order) =>
    !order ||
    !order.deliveryAddress ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    typeof order.itemsTotal !== "number" ||
    typeof order.shippingFee !== "number";

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
            const activeSessionResponse = await checkoutService.getActiveSession();
            const activeSession =
              activeSessionResponse?.data?.data?.session ||
              activeSessionResponse?.data?.session;
            const idempotencyKey =
              activeSession?._id === sessionId
                ? activeSession.checkoutSessionKey
                : null;
            // Payment successful, confirm checkout to create orders
            const result = await dispatch(
              confirmCheckout({ sessionId, idempotencyKey })
            ).unwrap();
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
      try {
        sessionStorage.removeItem("checkout_last_orders");
      } catch (error) {
        // no-op
      }
    }
  }, [dispatch, orders]);

  useEffect(() => {
    const hydrateOrders = async () => {
      if (!orders?.length || isHydratingOrders) return;
      const needsHydration = orders.some(isOrderIncomplete);
      if (!needsHydration) return;

      setIsHydratingOrders(true);
      try {
        const hydratedOrders = await Promise.all(
          orders.map(async (order) => {
            if (!order?._id) return order;
            if (!isOrderIncomplete(order)) return order;

            const response = await orderService.getOrderById(order._id);
            return response?.data?.data || response?.data || order;
          }),
        );
        setOrders(hydratedOrders);
      } catch (hydrateError) {
        // Keep partial data instead of blocking success page.
      } finally {
        setIsHydratingOrders(false);
      }
    };

    hydrateOrders();
  }, [isHydratingOrders, orders]);

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
  if (isProcessing || isHydratingOrders) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5">Preparing your receipt...</Typography>
            <Typography color="text.secondary">
              Please wait while we load your order details.
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

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  };

  const formatDeliveryAddress = (deliveryAddress = {}) => {
    const campus = deliveryAddress?.campusAddress;
    if (campus) {
      return [
        campus.campus,
        campus.building,
        `Floor ${campus.floor || "-"}`,
        `Room ${campus.room || "-"}`,
      ]
        .filter(Boolean)
        .join(", ");
    }

    const personal = deliveryAddress?.personalAddress;
    if (personal) {
      return [
        personal.addressLine1,
        personal.addressLine2,
        personal.city,
        personal.state,
        personal.postcode,
      ]
        .filter(Boolean)
        .join(", ");
    }

    const pickup = deliveryAddress?.pickupDetails;
    if (pickup?.location) return pickup.location;
    return "N/A";
  };

  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const subtotalAmount = orders.reduce(
    (sum, order) => sum + Number(order.itemsTotal || 0),
    0,
  );
  const shippingAmount = orders.reduce(
    (sum, order) => sum + Number(order.shippingFee || 0),
    0,
  );
  const discountAmount = orders.reduce(
    (sum, order) => sum + Number(order.totalDiscount || 0),
    0,
  );
  const platformFeeAmount = Math.max(
    0,
    Number((totalAmount - subtotalAmount - shippingAmount + discountAmount).toFixed(2)),
  );

  const paidAt = (() => {
    const candidates = orders
      .map((order) => order?.paymentDetails?.paidAt || order?.confirmedAt || order?.createdAt)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    return candidates[0] || null;
  })();

  const paymentReference =
    orders.find((order) => order?.paymentDetails?.toyyibPayCallbackRefNo)
      ?.paymentDetails?.toyyibPayCallbackRefNo ||
    orders.find((order) => order?.paymentDetails?.transactionId)
      ?.paymentDetails?.transactionId ||
    "N/A";

  const sellerGroups = (() => {
    const groups = {};
    orders.forEach((order) => {
      const sellerName =
        order?.seller?.name || order?.seller?.username || "Unknown Seller";
      if (!groups[sellerName]) {
        groups[sellerName] = {
          sellerName,
          status: order?.status || "confirmed",
          items: [],
        };
      }
      (order.items || []).forEach((item) => {
        groups[sellerName].items.push({
          name: item?.name || "Item",
          quantity: Number(item?.quantity || 1),
          unitPrice:
            typeof item?.effectivePrice === "number"
              ? item.effectivePrice
              : typeof item?.price === "number"
                ? item.price
                : null,
        });
      });
    });
    return Object.values(groups);
  })();

  const primaryOrder = orders[0];
  const receiptOrderId =
    orders.length === 1
      ? primaryOrder?.orderNumber || primaryOrder?._id
      : `${primaryOrder?.orderNumber || primaryOrder?._id} +${orders.length - 1} more`;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ maxWidth: 760, mx: "auto" }}>
            <Box sx={{ textAlign: "center", py: 1 }}>
              <SuccessIcon
                sx={{ fontSize: { xs: 72, md: 86 }, color: "success.main", mb: 2 }}
                aria-hidden="true"
              />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Order Confirmed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
                Your payment was successful. We&apos;ve sent your order details to your email.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                {formatDateTime(paidAt)}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                p: { xs: 2, md: 2.5 },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Order ID
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {receiptOrderId}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    bgcolor: "success.main",
                    color: "#111",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 0.2,
                  }}
                >
                  Paid
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Payment Reference: {paymentReference}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Paid At: {formatDateTime(paidAt)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                Delivery Details
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {primaryOrder?.deliveryAddress?.recipientName || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDeliveryAddress(primaryOrder?.deliveryAddress)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Items
              </Typography>
              <Box sx={{ display: "grid", gap: 1.25 }}>
                {sellerGroups.map((group, groupIndex) => (
                  <Box
                    key={`${group.sellerName}-${groupIndex}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {group.sellerName}
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: 10,
                          bgcolor: "action.selected",
                          color: "text.secondary",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "capitalize",
                        }}
                      >
                        {group.status}
                      </Box>
                    </Box>
                    <Box sx={{ display: "grid", gap: 0.85 }}>
                      {group.items.map((item, itemIndex) => (
                        <Box
                          key={`${group.sellerName}-${item.name}-${itemIndex}`}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                            py: 0.85,
                            px: 1,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            x{item.quantity}
                          </Typography>
                          {typeof item.unitPrice === "number" ? (
                            <Typography variant="body2" sx={{ minWidth: 84, textAlign: "right" }}>
                              RM {item.unitPrice.toFixed(2)}
                            </Typography>
                          ) : null}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: "grid", gap: 0.8 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2">RM {subtotalAmount.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2">RM {shippingAmount.toFixed(2)}</Typography>
                </Box>
                {platformFeeAmount > 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Platform Fee
                    </Typography>
                    <Typography variant="body2">RM {platformFeeAmount.toFixed(2)}</Typography>
                  </Box>
                ) : null}
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Paid
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                    RM {totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2.5 }}>
              You will receive an email confirmation shortly.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                component={Link}
                to={ROUTES.ORDERS.PURCHASES}
                variant="contained"
                startIcon={<OrdersIcon />}
                sx={{ textTransform: "none", fontWeight: 700, minWidth: 180 }}
              >
                View Orders
              </Button>
              <Button
                component={Link}
                to={ROUTES.BROWSE}
                variant="outlined"
                startIcon={<HomeIcon />}
                sx={{ textTransform: "none", fontWeight: 700, minWidth: 180 }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutSuccessPage;
