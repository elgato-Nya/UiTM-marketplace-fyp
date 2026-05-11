import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkoutService } from "../../features/checkout/service/checkoutService";
import orderService from "../../features/orders/service/orderService";
import { ROUTES } from "../../constants/routes";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractApiPayload = (response) =>
  response?.data?.data || response?.data || null;

const CheckoutPaymentReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isProcessing, setIsProcessing] = useState(true);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const hasSyncedPaymentResult = useRef(false);

  const statusId = searchParams.get("status_id");
  const orderId = searchParams.get("order_id");
  const rawStatusReason =
    searchParams.get("status_reason") || searchParams.get("msg");
  const statusReason =
    rawStatusReason && rawStatusReason.toLowerCase() !== "ok"
      ? rawStatusReason
      : "";
  const isSuccessHint = String(statusId) === "1";

  const heading = useMemo(() => {
    if (isProcessing) return "Verifying your payment";
    if (paymentStatus === "paid") return "Payment completed";
    return "Payment Was Not Completed";
  }, [isProcessing, paymentStatus]);

  useEffect(() => {
    if (isProcessing) return;
    if (paymentStatus !== "paid") return;
    if (!order?._id) return;

    navigate(ROUTES.CHECKOUT.SUCCESS, {
      replace: true,
      state: { orders: [order] },
    });
  }, [isProcessing, navigate, order, paymentStatus]);

  const fetchOrderPaymentStatus = async (targetOrderId) => {
    const response = await checkoutService.getOrderPaymentStatus(targetOrderId);
    const payload = extractApiPayload(response);

    setPaymentStatus(payload?.paymentStatus || "");
    setOrder((previous) => ({
      ...previous,
      _id: payload?.orderId || previous?._id || targetOrderId,
      orderNumber: payload?.orderNumber || previous?.orderNumber,
      totalAmount: payload?.totalAmount ?? previous?.totalAmount,
    }));

    return payload;
  };

  const hydrateOrderDetails = async (targetOrderId) => {
    const response = await orderService.getOrderById(targetOrderId);
    const fullOrder = extractApiPayload(response);

    if (!fullOrder || typeof fullOrder !== "object") return;

    setOrder((previous) => ({
      ...previous,
      _id: fullOrder._id || previous?._id || targetOrderId,
      orderNumber: fullOrder.orderNumber || previous?.orderNumber,
      totalAmount:
        fullOrder.totalAmount !== undefined
          ? fullOrder.totalAmount
          : previous?.totalAmount,
      seller: fullOrder.seller || previous?.seller,
      createdAt: fullOrder.createdAt || previous?.createdAt,
    }));
  };

  useEffect(() => {
    if (hasSyncedPaymentResult.current) {
      return undefined;
    }

    hasSyncedPaymentResult.current = true;

    let isCancelled = false;
    const syncPaymentResult = async () => {
      if (!orderId) {
        setError("Missing order reference from payment return.");
        setIsProcessing(false);
        return;
      }

      try {
        const maxAttempts = 10;
        let latestStatusPayload = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          const payload = await fetchOrderPaymentStatus(orderId);
          latestStatusPayload = payload;

          if (payload?.paymentStatus === "paid") break;
          if (["payment_failed", "failed", "cancelled", "expired"].includes(payload?.paymentStatus)) break;
          if (payload?.paymentStatus === "pending_payment") {
            setPendingMessage(
              "Your bank is still confirming the payment. This may take a few seconds."
            );
          }

          if (attempt < maxAttempts) {
            await sleep(2500);
          }
        }

        try {
          await hydrateOrderDetails(orderId);
        } catch (hydrateError) {
          // Non-blocking: payment status is still valid even if detail hydration fails.
        }

        if (isCancelled) return;

        if (latestStatusPayload?.paymentStatus === "paid") {
          setError("");
        } else if (latestStatusPayload?.paymentStatus === "pending_payment") {
          setError("");
        } else if (
          isSuccessHint &&
          latestStatusPayload?.paymentStatus !== "paid"
        ) {
          setError(
            "Payment was approved, but we are still waiting for confirmation. Please check your order status in Purchases.",
          );
        } else {
          setError(statusReason || "Payment failed or was cancelled by user.");
        }
      } catch (requestError) {
        if (isCancelled) return;
        setError("Unable to verify payment result. Please check your Purchases page.");
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    syncPaymentResult();
    return () => {
      isCancelled = true;
    };
  }, [isSuccessHint, navigate, orderId, statusReason]);

  const handleCheckStatusAgain = async () => {
    if (!orderId || isRefreshingStatus) return;
    setIsRefreshingStatus(true);
    try {
      const payload = await fetchOrderPaymentStatus(orderId);
      if (payload?.paymentStatus === "paid") {
        navigate(ROUTES.CHECKOUT.SUCCESS, {
          replace: true,
          state: { orders: order ? [order] : [] },
        });
        return;
      }
      if (payload?.paymentStatus === "pending_payment") {
        setError("");
        setPendingMessage(
          "Payment is still pending confirmation. You may wait and check again, or continue payment with a new bill.",
        );
        return;
      }
      setError(
        statusReason ||
          "Payment was not completed. You can continue payment with a new bill.",
      );
    } catch (requestError) {
      setError("Unable to refresh payment status right now. Please try again.");
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!order?._id || isRetryingPayment) return;
    setIsRetryingPayment(true);
    try {
      const response = await checkoutService.retryOrderPayment(order._id);
      const alreadyPaid =
        response?.data?.data?.alreadyPaid || response?.data?.alreadyPaid;
      if (alreadyPaid) {
        navigate(ROUTES.CHECKOUT.SUCCESS, {
          replace: true,
          state: { orders: [order] },
        });
        return;
      }
      const billUrl = response?.data?.data?.billUrl || response?.data?.billUrl;
      if (!billUrl) {
        throw new Error("Unable to create payment link for this order.");
      }
      navigate(ROUTES.CHECKOUT.REDIRECTING_PAYMENT, {
        replace: true,
        state: {
          billUrl,
          orderId: order?._id,
        },
      });
    } catch (retryError) {
      setError(
        retryError?.response?.data?.message ||
          retryError?.message ||
          "Unable to generate a new payment link now. Please try again from Purchases.",
      );
    } finally {
      setIsRetryingPayment(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: { xs: 4, md: 6 }, px: { xs: 2.5, md: 4 } }}>
          {isProcessing ? (
            <>
              <CircularProgress size={56} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                {heading}
              </Typography>
              <Typography color="text.secondary">
                Please wait while we verify your payment with our server.
              </Typography>
            </>
          ) : (
            <>
              {paymentStatus !== "paid" ? (
                <>
                  <Box
                    sx={{
                      mx: "auto",
                      mb: 2.5,
                      width: 78,
                      height: 78,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "warning.light",
                      color: "warning.dark",
                    }}
                  >
                    <Typography variant="h4" fontWeight={800}>
                      !
                    </Typography>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                    Payment Was Not Completed
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {paymentStatus === "pending_payment"
                      ? "Your payment is still being verified."
                      : "Your payment was cancelled or could not be processed."}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
                    {paymentStatus === "pending_payment"
                      ? pendingMessage || "Your bank is still confirming the payment. This may take a few seconds."
                      : "No charges were made to your account. If a payment was attempted, it will be automatically refunded by the bank."}
                  </Typography>

                  <Box
                    sx={{
                      textAlign: "left",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      px: 2,
                      py: 1.75,
                      mb: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>
                      Order Details
                    </Typography>
                    <Box sx={{ display: "grid", gap: 0.75 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Order ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order?.orderNumber || order?._id || orderId || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Order Amount</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          RM {(Number(order?.totalAmount || 0)).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Merchant</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order?.seller?.name || order?.seller?.username || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Order Date</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {error ? (
                    <Typography color="error.main" sx={{ mb: 2, fontSize: 14 }}>
                      {error}
                    </Typography>
                  ) : null}

                  <Box sx={{ display: "grid", gap: 1.25, maxWidth: 520, mx: "auto", width: "100%" }}>
                    {paymentStatus !== "pending_payment" ? (
                      <Button
                        variant="contained"
                        onClick={handleRetryPayment}
                        disabled={isRetryingPayment || !order?._id}
                        fullWidth
                        sx={{ fontWeight: 700 }}
                        >
                          {isRetryingPayment
                            ? "Generating new payment link..."
                            : "Retry Payment"}
                      </Button>
                    ) : (
                      <Box sx={{ display: "grid", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={handleCheckStatusAgain}
                          disabled={isRefreshingStatus}
                          fullWidth
                          sx={{ fontWeight: 700 }}
                        >
                          {isRefreshingStatus ? "Checking status..." : "Check Status Again"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleRetryPayment}
                          disabled={isRetryingPayment || !order?._id}
                          fullWidth
                          sx={{ fontWeight: 700 }}
                        >
                          {isRetryingPayment
                            ? "Generating new payment link..."
                            : "Continue Payment"}
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
                      <Button
                        variant="outlined"
                        component={Link}
                        to={order?._id ? ROUTES.ORDERS.DETAIL(order._id) : ROUTES.ORDERS.PURCHASES}
                        fullWidth
                      >
                        View Order
                      </Button>
                      <Button variant="outlined" component={Link} to={ROUTES.ORDERS.PURCHASES} fullWidth>
                        Go to Purchases
                      </Button>
                      <Button variant="outlined" component={Link} to={ROUTES.CART} fullWidth>
                        Return to Cart
                      </Button>
                    </Box>
                  </Box>

                  <Typography color="text.secondary" sx={{ mt: 3, fontSize: 13 }}>
                    If you continue experiencing issues, please contact support.
                  </Typography>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  <Typography variant="h5" gutterBottom sx={{ width: "100%" }}>
                    {heading}
                  </Typography>
                  {error ? (
                    <Typography color="warning.main" sx={{ width: "100%", mb: 1.5 }}>
                      {error}
                    </Typography>
                  ) : null}
                  {order?._id ? (
                    <Button
                      variant="contained"
                      component={Link}
                      to={ROUTES.ORDERS.DETAIL(order._id)}
                    >
                      View This Order
                    </Button>
                  ) : null}
                  <Button variant="outlined" component={Link} to={ROUTES.ORDERS.PURCHASES}>
                    Go to Purchases
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutPaymentReturnPage;
