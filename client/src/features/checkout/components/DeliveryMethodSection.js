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
  ADDRESS_TYPE,
} from "../../../constants/orderConstant";

/**
 * Delivery Method Section Component
 * Uses delivery methods directly from orderConstant.js that matches server enum
 * Filters available methods based on selected address type
 */

// Mapping of address types to allowed delivery methods
const ADDRESS_TYPE_DELIVERY_METHODS = {
  [ADDRESS_TYPE.CAMPUS]: [
    DELIVERY_METHOD.CAMPUS_DELIVERY,
    DELIVERY_METHOD.ROOM_DELIVERY,
  ],
  [ADDRESS_TYPE.PERSONAL]: [DELIVERY_METHOD.DELIVERY],
  [ADDRESS_TYPE.PICKUP]: [DELIVERY_METHOD.SELF_PICKUP, DELIVERY_METHOD.MEETUP],
};

const DeliveryMethodSection = ({
  selectedMethod,
  onMethodSelect,
  addressType,
  totalAmount,
  error,
}) => {
  const { theme } = useTheme();
  const codLimit = 500;
  const isCodAllowed = totalAmount <= codLimit;

  const handleMethodChange = (event) => {
    onMethodSelect?.(event.target.value);
  };

  // Get allowed delivery methods for the current address type
  const allowedMethods = ADDRESS_TYPE_DELIVERY_METHODS[addressType] || [];

  // Map delivery methods from constants with UI presentation data
  const deliveryMethodOptions = [
    {
      id: DELIVERY_METHOD.DELIVERY,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.DELIVERY],
      description: "3-5 business days",
      icon: ShippingIcon,
      addressTypes: [ADDRESS_TYPE.PERSONAL],
    },
    {
      id: DELIVERY_METHOD.CAMPUS_DELIVERY,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.CAMPUS_DELIVERY],
      description: "Delivery within campus",
      icon: ShippingIcon,
      addressTypes: [ADDRESS_TYPE.CAMPUS],
    },
    {
      id: DELIVERY_METHOD.SELF_PICKUP,
      label: DELIVERY_METHOD_LABELS[DELIVERY_METHOD.SELF_PICKUP],
      description: "Pick up from seller",
      icon: ShippingIcon,
      addressTypes: [ADDRESS_TYPE.PICKUP],
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

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "block",
              fontSize: "0.75rem",
            }}
          >
            Delivery methods available depend on your selected address type.
            Change your address type to use different delivery options.
          </Typography>

          <RadioGroup
            aria-labelledby="delivery-method-heading"
            name="delivery-method"
            value={selectedMethod}
            onChange={handleMethodChange}
          >
            {deliveryMethodOptions.map((method) => {
              const Icon = method.icon;
              const isAllowed = allowedMethods.includes(method.id);

              return (
                <Box
                  key={method.id}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    border: 1,
                    borderColor:
                      selectedMethod === method.id
                        ? "primary.main"
                        : isAllowed
                          ? "divider"
                          : "action.disabledBackground",
                    borderRadius: 1,
                    backgroundColor:
                      selectedMethod === method.id
                        ? "action.selected"
                        : !isAllowed
                          ? "action.disabledBackground"
                          : "transparent",
                    opacity: isAllowed ? 1 : 0.5,
                    transition: "all 0.2s",
                    "&:hover": isAllowed
                      ? {
                          borderColor: "primary.main",
                          backgroundColor: "action.hover",
                        }
                      : {},
                    cursor: isAllowed ? "pointer" : "not-allowed",
                  }}
                >
                  <FormControlLabel
                    value={method.id}
                    disabled={!isAllowed}
                    control={
                      <Radio
                        disabled={!isAllowed}
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
                            color: isAllowed ? "primary.main" : "text.disabled",
                          }}
                          aria-hidden="true"
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight:
                                selectedMethod === method.id ? 600 : 400,
                              color: isAllowed
                                ? "text.primary"
                                : "text.disabled",
                            }}
                          >
                            {method.label}
                          </Typography>
                          <Typography
                            id={`${method.id}-description`}
                            variant="body2"
                            color={
                              isAllowed ? "text.secondary" : "text.disabled"
                            }
                          >
                            {isAllowed
                              ? method.description
                              : "Not available for selected address type"}
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
