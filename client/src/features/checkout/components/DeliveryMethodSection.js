import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

import { useTheme } from "../../../hooks/useTheme";
import {
  DELIVERY_METHOD,
  DELIVERY_METHOD_LABELS,
} from "../../../constants/orderConstant";

/**
 * Delivery Method Section Component
 * Uses delivery methods directly from orderConstant.js that matches server enum
 */

const DeliveryMethodSection = ({
  selectedMethod,
  onMethodSelect,
  totalAmount,
  error,
}) => {
  const { theme } = useTheme();
  const codLimit = 500;
  const isCodAllowed = totalAmount <= codLimit;

  const handleMethodChange = (event) => {
    onMethodSelect?.(event.target.value);
  };

  // Map delivery methods from constants with UI presentation data
  const deliveryMethodOptions = [
    {
      id: DELIVERY_METHOD.DELIVERY,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.DELIVERY],
      description: "3-5 business days",
      icon: ShippingIcon,
    },
    {
      id: DELIVERY_METHOD.CAMPUS_DELIVERY,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.CAMPUS_DELIVERY],
      description: "Delivery within campus",
      icon: ShippingIcon,
    },
    {
      id: DELIVERY_METHOD.SELF_PICKUP,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.SELF_PICKUP],
      description: "Pick up from seller",
      icon: ShippingIcon,
    },
  ];

  return (
    <Box component="section" aria-labelledby="delivery-method-heading">
      <Card>
        <CardContent>
          <Typography
            id="delivery-method-heading"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Delivery Method
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <RadioGroup
            aria-labelledby="delivery-method-heading"
            name="delivery-method"
            value={selectedMethod}
            onChange={handleMethodChange}
          >
            {deliveryMethodOptions.map((method) => {
              const Icon = method.icon;

              return (
                <Box
                  key={method.id}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    border: 1,
                    borderColor:
                      selectedMethod === method.id ? "primary.main" : "divider",
                    borderRadius: 1,
                    backgroundColor:
                      selectedMethod === method.id
                        ? "action.selected"
                        : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <FormControlLabel
                    value={method.id}
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <Icon
                          sx={{
                            color: "primary.main",
                          }}
                          aria-hidden="true"
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight:
                                selectedMethod === method.id ? 600 : 400,
                              color: "text.primary",
                            }}
                          >
                            {method.label}
                          </Typography>
                          <Typography
                            id={`${method.id}-description`}
                            variant="body2"
                            color="text.secondary"
                          >
                            {method.description}
                          </Typography>
                        </Box>
                        {method.tooltip && (
                          <Tooltip title={method.tooltip} arrow>
                            <IconButton
                              size="small"
                              aria-label={`Information about ${method.label}`}
                              sx={{ ml: "auto" }}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </Box>
  );
};
export default DeliveryMethodSection;
