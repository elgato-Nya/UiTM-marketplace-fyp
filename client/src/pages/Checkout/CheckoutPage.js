import { useEffect, useState } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import {
  createSessionFromCart,
  createSessionFromListing,
  createPaymentIntent,
  confirmCheckout,
  updateSession,
  selectCheckoutSession,
  selectCheckoutLoading,
  selectCheckoutError,
  selectSessionExpired,
  selectHasActiveSession,
  selectPaymentIntent,
} from "../../features/checkout/store/checkoutSlice";
import { selectAddresses } from "../../features/profile/store/addressSlice";
import { validateCheckoutForm } from "../../validation/checkoutValidator";
import { PAYMENT_METHOD, DELIVERY_METHOD } from "../../constants/orderConstant";
import SessionTimer from "../../features/checkout/components/SessionTimer";
import AddressSection from "../../features/checkout/components/AddressSection";
import DeliveryMethodSection from "../../features/checkout/components/DeliveryMethodSection";
import PaymentMethodSection from "../../features/checkout/components/PaymentMethodSection";
import OrderSummary from "../../features/checkout/components/OrderSummary";

const CheckoutPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  // Redux selectors
  const session = useSelector(selectCheckoutSession);
  const paymentIntent = useSelector(selectPaymentIntent);
  const isLoading = useSelector(selectCheckoutLoading);
  const error = useSelector(selectCheckoutError);
  const hasActiveSession = useSelector(selectHasActiveSession);
  const sessionExpired = useSelector(selectSessionExpired);
  const addressesState = useSelector(selectAddresses);
  const { addresses } = addressesState;

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(
    DELIVERY_METHOD.DELIVERY
  );
  const [paymentMethod, setPaymentMethod] = useState(
    PAYMENT_METHOD.CREDIT_CARD
  );
  const [cardReady, setCardReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Get checkout source from location state
  const { source, listingId, quantity } = location.state || {};

  // Initialize checkout session
  useEffect(() => {
    if (!hasActiveSession && !isLoading) {
      if (source === "cart") {
        dispatch(createSessionFromCart());
      } else if (source === "listing" && listingId) {
        dispatch(
          createSessionFromListing({
            listingId,
            quantity: quantity || 1,
          })
        );
      } else {
        // No valid source, redirect to cart
        navigate(ROUTES.CART, { replace: true });
      }
    }
  }, [
    dispatch,
    hasActiveSession,
    isLoading,
    source,
    listingId,
    quantity,
    navigate,
  ]);

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
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod, isInitialized]);

  // Handle session expiration
  useEffect(() => {
    if (sessionExpired) {
      navigate(ROUTES.CART, {
        replace: true,
        state: {
          message: "Your checkout session has expired. Please try again.",
        },
      });
    }
  }, [sessionExpired, navigate]);

  const handleConfirmOrder = async () => {
    // Validate form using centralized validation utility
    const { isValid, errors } = validateCheckoutForm(
      {
        selectedAddressId,
        deliveryMethod,
        paymentMethod,
        cardReady,
      },
      session
    );

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setIsConfirming(true);

    try {
      // Find the selected address object
      const selectedAddress = addresses.find(
        (addr) => addr._id === selectedAddressId
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
        })
      ).unwrap();

      // Create payment intent if using card payment
      if (paymentMethod === PAYMENT_METHOD.CREDIT_CARD) {
        if (!stripe || !elements) {
          throw new Error("Stripe is not loaded");
        }

        // Create payment intent
        const result = await dispatch(
          createPaymentIntent(session._id)
        ).unwrap();

        const intentData = result.paymentIntent;

        // Confirm card payment with Stripe
        const { error: stripeError, paymentIntent: confirmedIntent } =
          await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name:
                  selectedAddress?.recipientName ||
                  selectedAddress?.fullName ||
                  session.shippingAddress?.recipientName ||
                  "Customer",
              },
            },
          });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (confirmedIntent.status !== "succeeded") {
          throw new Error("Payment confirmation failed");
        }
      } else if (paymentMethod === PAYMENT_METHOD.E_WALLET) {
        if (!stripe) {
          throw new Error("Stripe is not loaded");
        }

        // Create payment intent for GrabPay
        const result = await dispatch(
          createPaymentIntent(session._id)
        ).unwrap();

        const intentData = result.paymentIntent;

        // Confirm payment with GrabPay - will redirect to GrabPay app
        const { error: stripeError } = await stripe.confirmGrabPayPayment(
          intentData.clientSecret,
          {
            return_url: `${window.location.origin}/checkout/success?session_id=${session._id}`,
          }
        );

        // If error, throw it (otherwise user was redirected)
        if (stripeError) {
          throw new Error(stripeError.message);
        }

        // User will be redirected to GrabPay, then back to return_url
        return;
      }

      // Confirm checkout (only sessionId is needed - other details already in session)
      const result = await dispatch(confirmCheckout(session._id)).unwrap();

      // Navigate to success page
      navigate(ROUTES.CHECKOUT.SUCCESS, {
        replace: true,
        state: { orders: result.orders },
      });
    } catch (err) {
      console.error("Checkout confirmation error:", err);
      setValidationErrors({
        general: err.message || "Failed to confirm order. Please try again.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSessionExpired = () => {
    navigate(ROUTES.CART, {
      replace: true,
      state: {
        message: "Your checkout session has expired. Please try again.",
      },
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
          Return to Cart
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
                error={validationErrors.address}
              />

              {/* Delivery Method */}
              <DeliveryMethodSection
                selectedMethod={deliveryMethod}
                onMethodSelect={setDeliveryMethod}
                totalAmount={session.pricing?.totalAmount || 0}
                error={validationErrors.delivery}
              />

              {/* Payment Method */}
              <PaymentMethodSection
                selectedMethod={paymentMethod}
                onMethodSelect={setPaymentMethod}
                deliveryMethod={deliveryMethod}
                totalAmount={session.pricing?.totalAmount || 0}
                onCardReady={() => setCardReady(true)}
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
                  (paymentMethod !== PAYMENT_METHOD.COD && !stripe)
                }
                sx={{ mt: 2 }}
              >
                {isConfirming ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing...
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
