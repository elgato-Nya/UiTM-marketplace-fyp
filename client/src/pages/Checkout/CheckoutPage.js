import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import {
  createSessionFromCart,
  createSessionFromListing,
  confirmCheckout,
  getActiveSession,
  updateSession,
  selectCheckoutSession,
  selectCheckoutLoading,
  selectCheckoutError,
  selectSessionExpired,
  selectHasActiveSession,
} from "../../features/checkout/store/checkoutSlice";
import { selectAddresses } from "../../features/profile/store/addressSlice";
import { validateCheckoutForm } from "../../validation/checkoutValidator";
import { PAYMENT_METHOD, DELIVERY_METHOD } from "../../constants/orderConstant";
import { ROUTES } from "../../constants/routes";
import SessionTimer from "../../features/checkout/components/SessionTimer";
import AddressSection from "../../features/checkout/components/AddressSection";
import DeliveryMethodSection from "../../features/checkout/components/DeliveryMethodSection";
import PaymentMethodSection from "../../features/checkout/components/PaymentMethodSection";
import OrderSummary from "../../features/checkout/components/OrderSummary";
import { checkoutService } from "../../features/checkout/service/checkoutService";

const CheckoutPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const session = useSelector(selectCheckoutSession);
  const isLoading = useSelector(selectCheckoutLoading);
  const error = useSelector(selectCheckoutError);
  const hasActiveSession = useSelector(selectHasActiveSession);
  const sessionExpired = useSelector(selectSessionExpired);
  const addressesState = useSelector(selectAddresses);
  const { addresses } = addressesState;

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState("campus");
  const [deliveryMethod, setDeliveryMethod] = useState(
    DELIVERY_METHOD.CAMPUS_DELIVERY,
  );
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.TOYYIBPAY);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [hasSubmittedOrder, setHasSubmittedOrder] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  // Get checkout source from location state
  const { source, listingId, quantity } = location.state || {};

  // Initialize checkout session
  useEffect(() => {
    if (isConfirming || isRedirectingToPayment || hasSubmittedOrder) return;
    if (!hasActiveSession && !isLoading) {
      if (source === "cart") {
        dispatch(createSessionFromCart());
      } else if (source === "listing" && listingId) {
        dispatch(
          createSessionFromListing({
            listingId,
            quantity: quantity || 1,
          }),
        );
      } else if (!recoveryAttempted) {
        setRecoveryAttempted(true);
        dispatch(getActiveSession())
          .unwrap()
          .then((payload) => {
            if (!payload?.session) {
              setValidationErrors({
                general:
                  "No active checkout session found. Your order may already be created. Please continue from Purchases.",
              });
            }
          })
          .catch(() => {
            setValidationErrors({
              general:
                "No active checkout session found. Please start checkout from your cart.",
            });
          });
      } else {
        setValidationErrors({
          general:
            "No active checkout session found. Your order may already be created. Please continue from Purchases.",
        });
      }
    }
  }, [
    dispatch,
    hasActiveSession,
    hasSubmittedOrder,
    isConfirming,
    isLoading,
    isRedirectingToPayment,
    source,
    listingId,
    quantity,
    navigate,
    recoveryAttempted,
  ]);

  useEffect(() => {
    if (isLoading || session) return;
    if (source === "cart" || (source === "listing" && listingId)) return;
    if (!recoveryAttempted) return;

    navigate(ROUTES.ORDERS.PURCHASES, {
      replace: true,
      state: {
        notice:
          "No active checkout session found. If you already created an order, continue payment from Purchases.",
      },
    });
  }, [isLoading, session, source, listingId, recoveryAttempted, navigate]);

  // Set initial values from session and mark as initialized
  useEffect(() => {
    if (session?.shippingAddress?._id) {
      setSelectedAddressId(session.shippingAddress._id);
    }
    // Initialize delivery method from session if available
    if (session?.deliveryMethod && !isInitialized) {
      setDeliveryMethod(session.deliveryMethod);
      setIsInitialized(true);
    } else if (session?._id && !isInitialized) {
      // Mark as initialized once session is loaded
      setIsInitialized(true);
    }
  }, [
    session?.shippingAddress,
    session?.deliveryMethod,
    session?._id,
    isInitialized,
  ]);

  // Update session when delivery method changes to recalculate pricing (only after initialization)
  useEffect(() => {
    // Skip if not initialized or if session doesn't exist
    if (!isInitialized || !session?._id || !hasActiveSession) {
      return;
    }

    // Only update if delivery method is different from session's current value
    if (deliveryMethod && deliveryMethod !== session?.deliveryMethod) {
      dispatch(
        updateSession({
          sessionId: session._id,
          data: {
            deliveryMethod,
          },
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod, isInitialized]);

  // Handle session expiration
  useEffect(() => {
    if (sessionExpired && !isConfirming && !isRedirectingToPayment) {
      setValidationErrors({
        general:
          "Your checkout session expired. Please refresh checkout from cart.",
      });
    }
  }, [sessionExpired, isConfirming, isRedirectingToPayment]);

  // Handle address type change - auto-select appropriate delivery method
  const handleAddressTypeChange = useCallback(
    (newAddressType) => {
      setSelectedAddressType(newAddressType);

      // Map address type to default delivery method
      const addressTypeToDeliveryMethod = {
        campus: DELIVERY_METHOD.CAMPUS_DELIVERY,
        personal: DELIVERY_METHOD.DELIVERY,
        pickup: DELIVERY_METHOD.SELF_PICKUP,
      };

      const newDeliveryMethod = addressTypeToDeliveryMethod[newAddressType];
      if (newDeliveryMethod && newDeliveryMethod !== deliveryMethod) {
        setDeliveryMethod(newDeliveryMethod);
      }
    },
    [deliveryMethod],
  );

  /**
   * Confirm checkout and create the payment bill when ToyyibPay is selected.
   * @returns {Promise<void>}
   */
  const handleConfirmOrder = async () => {
    // Validate form using centralized validation utility
    const { isValid, errors } = validateCheckoutForm(
      {
        selectedAddressId,
        deliveryMethod,
        paymentMethod,
      },
      session,
    );

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setIsConfirming(true);

    try {
      // Find the selected address object
      const selectedAddress = addresses.find(
        (addr) => addr._id === selectedAddressId,
      );

      if (!selectedAddress) {
        throw new Error("Please select a delivery address");
      }

      // Update session with delivery and payment details first
      await dispatch(
        updateSession({
          sessionId: session._id,
          data: {
            addressId: selectedAddressId,
            deliveryAddress: selectedAddress,
            deliveryMethod,
            paymentMethod,
          },
        }),
      ).unwrap();

      // Confirm checkout (only sessionId is needed - other details already in session)
      setHasSubmittedOrder(true);
      const result = await dispatch(
        confirmCheckout({
          sessionId: session._id,
          idempotencyKey: session.checkoutSessionKey,
        }),
      ).unwrap();

      if (paymentMethod === PAYMENT_METHOD.TOYYIBPAY) {
        setIsRedirectingToPayment(true);
        const order = result.orders?.[0];

        if (!order?._id) {
          throw new Error("Unable to create ToyyibPay bill for this order");
        }

        // Create ToyyibPay bill. Do NOT send a localhost `returnUrl` (ToyyibPay rejects non-public URLs).
        // Let the server use its configured `TOYYIBPAY_RETURN_URL` (env) which must be a public HTTPS URL.
        let billResponse;
        try {
          billResponse = await checkoutService.createOrderBill(order._id);
        } catch (err) {
          console.error("ToyyibPay bill creation failed:", err);
          setValidationErrors({
            general:
              (err?.response &&
                err.response.data &&
                err.response.data.message) ||
              err.message ||
              "Failed to create payment bill. Order was created — you can pay later from your orders.",
          });

          return;
        }

        const billUrl =
          billResponse?.data?.data?.billUrl || billResponse?.data?.billUrl;

        if (!billUrl) {
          // If bill URL is missing, fallback to success page with an error message
          console.error("ToyyibPay response missing billUrl", billResponse);
          setValidationErrors({
            general:
              "Payment provider did not return a payment URL. Order created — view your orders to complete payment.",
          });
          return;
        }

        try {
          sessionStorage.setItem(
            "checkout_last_orders",
            JSON.stringify(result.orders || []),
          );
        } catch (storageError) {
          console.warn("Unable to persist checkout orders", storageError);
        }

        navigate(ROUTES.CHECKOUT.REDIRECTING_PAYMENT, {
          replace: true,
          state: {
            billUrl,
            orderId: order._id,
          },
        });
        return;
      }

      setValidationErrors({
        general:
          "Order created successfully. Please complete payment from your Purchases page.",
      });
    } catch (err) {
      console.error("Checkout confirmation error:", err);
      setValidationErrors({
        general: err.message || "Failed to confirm order. Please try again.",
      });
    } finally {
      setIsConfirming(false);
      if (paymentMethod !== PAYMENT_METHOD.TOYYIBPAY) {
        setIsRedirectingToPayment(false);
      }
    }
  };

  const handleSessionExpired = () => {
    if (isConfirming || isRedirectingToPayment) return;
    setValidationErrors({
      general:
        "Your checkout session expired. Please reload checkout from your cart.",
    });
  };

  if (isLoading && !session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load checkout session. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.CART)}
          sx={{ mt: 2 }}
        >
          Go to Cart
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(ROUTES.ORDERS.PURCHASES)}
          sx={{ mt: 2, ml: 2 }}
        >
          Go to Purchases
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 4 }}>
      {/* Session Timer */}
      <SessionTimer
        expiresAt={session.expiresAt}
        onExpire={handleSessionExpired}
      />

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          Checkout
        </Typography>

        {validationErrors.general && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setValidationErrors({})}
          >
            {validationErrors.general}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {typeof error === "string"
              ? error
              : error?.message || "An error occurred"}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Forms */}
          <Grid size={{ sm: 12, md: 4 }} sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Address Section */}
              <AddressSection
                selectedAddressId={selectedAddressId}
                onAddressSelect={setSelectedAddressId}
                onAddressTypeChange={handleAddressTypeChange}
                error={validationErrors.address}
              />

              {/* Delivery Method */}
              <DeliveryMethodSection
                selectedMethod={deliveryMethod}
                onMethodSelect={setDeliveryMethod}
                addressType={selectedAddressType}
                totalAmount={session.pricing?.totalAmount || 0}
                error={validationErrors.delivery}
              />

              {/* Payment Method */}
              <PaymentMethodSection
                selectedMethod={paymentMethod}
                onMethodSelect={setPaymentMethod}
                deliveryMethod={deliveryMethod}
                totalAmount={session.pricing?.totalAmount || 0}
                error={validationErrors.payment}
              />
            </Box>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid size={{ sm: 12, md: 8 }} sx={{ width: "100%" }}>
            <Box
              sx={{
                position: isMobile ? "relative" : "sticky",
                top: isMobile ? 0 : 140, // Below timer (64px header + 56px timer + 20px margin)
              }}
            >
              <OrderSummary
                sellerGroups={session.sellerGroups || []}
                pricing={session.pricing || {}}
                deliveryMethod={deliveryMethod}
                paymentMethod={paymentMethod}
              />

              {/* Confirm Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleConfirmOrder}
                disabled={
                  isConfirming ||
                  isLoading ||
                  isRedirectingToPayment ||
                  hasSubmittedOrder
                }
                sx={{ mt: 2 }}
              >
                {isConfirming ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating secure payment link...
                  </>
                ) : (
                  `Confirm Order (RM ${(session.pricing?.totalAmount || 0).toFixed(2)})`
                )}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", mt: 1 }}
              >
                By confirming, you agree to our Terms of Service and Privacy
                Policy
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
