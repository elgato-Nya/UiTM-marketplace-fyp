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
      description: "Currently unavailable",
      icon: CardIcon,
      disabled: true, // Disabled due to Stripe Connect limitation
    },
    {
      id: PAYMENT_METHOD.E_WALLET,
      label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.E_WALLET],
      description: "Currently unavailable",
      icon: BankIcon,
      disabled: true, // Disabled due to Stripe Connect limitation
    },
    {
      id: PAYMENT_METHOD.COD,
      label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.COD],
      description: "Pay when you receive",
      icon: CashIcon,
      disabled: false,
    },
  ];

  return (
    <Box component="section" aria-labelledby="payment-method-heading">
      <Card>
        <CardContent
          sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}
        >
          <Typography
            id="payment-method-heading"
            variant="h6"
            component="h2"
            sx={{
              mb: 2,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            Payment Method
          </Typography>

          {/* Alert for unavailable payment methods */}
          <Alert severity="info" sx={{ mb: 2, py: { xs: 1, sm: 1.5 } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              Online Payment Temporarily Unavailable
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                lineHeight: { xs: 1.4, sm: 1.5 },
              }}
            >
              Stripe Connect is not available in Malaysia. Nekodez is currently
              working on integrating alternative payment gateways to support
              credit/debit cards and e-wallet payments. For now, only Cash on
              Delivery (COD) is available.
            </Typography>
          </Alert>

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
                method.disabled ||
                (method.id === PAYMENT_METHOD.COD && isCodDisabled);

              return (
                <Box key={method.id} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                  <Box
                    sx={{
                      p: { xs: 1, sm: 1.5 },
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
                          size="small"
                          slotProps={{
                            input: {
                              "aria-describedby": `${method.id}-description`,
                            },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.75, sm: 1 },
                            ml: { xs: 0, sm: 0.5 },
                          }}
                        >
                          <Icon
                            sx={{
                              color: isDisabled
                                ? "text.disabled"
                                : "primary.main",
                              fontSize: { xs: "1.25rem", sm: "1.5rem" },
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
                                fontSize: { xs: "0.9rem", sm: "1rem" },
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
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: "100%", m: 0 }}
                    />
                  </Box>

                  {/* Card input removed - payment methods disabled */}
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
