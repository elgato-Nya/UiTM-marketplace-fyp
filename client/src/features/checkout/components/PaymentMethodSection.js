import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";
import {
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  MonetizationOn as CashIcon,
} from "@mui/icons-material";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement } from "@stripe/react-stripe-js";

import { useTheme } from "../../../hooks/useTheme";
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
} from "../../../constants/orderConstant";

// Initialize Stripe (move to env variable in production)
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "your_stripe_publishable_key"
);

/**
 * Payment Method Section Component
 * Uses payment methods directly from orderConstant.js that matches server enum
 */

const CardElementWrapper = ({ onReady, error }) => {
  const { theme } = useTheme();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
        "::placeholder": {
          color: theme.palette.text.disabled,
        },
      },
      invalid: {
        color: theme.palette.error.main,
      },
    },
  };

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: error ? "error.main" : "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <CardElement options={cardElementOptions} onReady={onReady} />
    </Box>
  );
};

const PaymentMethodSectionContent = ({
  selectedMethod,
  onMethodSelect,
  deliveryMethod,
  totalAmount,
  onCardReady,
  error,
}) => {
  const { theme } = useTheme();
  const codLimit = 500;
  const isCodDisabled = totalAmount > codLimit;

  const handleMethodChange = (event) => {
    onMethodSelect?.(event.target.value);
  };

  // Map payment methods from constants with UI presentation data
  const paymentMethodOptions = [
    {
      id: PAYMENT_METHOD.CREDIT_CARD,
      label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.CREDIT_CARD],
      description: "Visa, Mastercard, American Express",
      icon: CardIcon,
    },
    {
      id: PAYMENT_METHOD.E_WALLET,
      label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.E_WALLET],
      description: "Pay via e-wallet",
      icon: BankIcon,
    },
    {
      id: PAYMENT_METHOD.COD,
      label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.COD],
      description: "Pay when you receive",
      icon: CashIcon,
    },
  ];

  return (
    <Box component="section" aria-labelledby="payment-method-heading">
      <Card>
        <CardContent>
          <Typography
            id="payment-method-heading"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Payment Method
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <RadioGroup
            aria-labelledby="payment-method-heading"
            name="payment-method"
            value={selectedMethod}
            onChange={handleMethodChange}
          >
            {paymentMethodOptions.map((method) => {
              const Icon = method.icon;
              const isDisabled =
                method.id === PAYMENT_METHOD.COD && isCodDisabled;

              return (
                <Box key={method.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor:
                        selectedMethod === method.id
                          ? "primary.main"
                          : "divider",
                      borderRadius: 1,
                      backgroundColor: isDisabled
                        ? "action.disabledBackground"
                        : selectedMethod === method.id
                          ? "action.selected"
                          : "transparent",
                      opacity: isDisabled ? 0.6 : 1,
                      transition: "all 0.2s",
                      "&:hover": isDisabled
                        ? {}
                        : {
                            borderColor: "primary.main",
                            backgroundColor: "action.hover",
                          },
                    }}
                  >
                    <FormControlLabel
                      value={method.id}
                      disabled={isDisabled}
                      control={
                        <Radio
                          slotProps={{
                            input: {
                              "aria-describedby": `${method.id}-description`,
                            },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Icon
                            sx={{
                              color: isDisabled
                                ? "text.disabled"
                                : "primary.main",
                            }}
                            aria-hidden="true"
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight:
                                  selectedMethod === method.id ? 600 : 400,
                                color: isDisabled
                                  ? "text.disabled"
                                  : "text.primary",
                              }}
                            >
                              {method.label}
                            </Typography>
                            <Typography
                              id={`${method.id}-description`}
                              variant="body2"
                              color={
                                isDisabled ? "text.disabled" : "text.secondary"
                              }
                            >
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: "100%", m: 0 }}
                    />
                  </Box>

                  {/* Show Stripe Card Element for card payment */}
                  {method.id === PAYMENT_METHOD.CREDIT_CARD &&
                    selectedMethod === PAYMENT_METHOD.CREDIT_CARD && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Enter your card details:
                        </Typography>
                        <CardElementWrapper
                          onReady={onCardReady}
                          error={error}
                        />
                      </Box>
                    )}
                </Box>
              );
            })}
          </RadioGroup>

          {totalAmount > codLimit && selectedMethod === PAYMENT_METHOD.COD && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cash on Delivery is only available for orders up to RM{" "}
              {codLimit.toFixed(2)}. Please select another payment method.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const PaymentMethodSection = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodSectionContent {...props} />
    </Elements>
  );
};

export default PaymentMethodSection;
