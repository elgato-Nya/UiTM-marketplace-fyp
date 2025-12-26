import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { LocalShipping, School, Store, CheckCircle } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * DeliveryMethodCard Component
 *
 * PURPOSE: Display a single delivery method option with fee
 * LOCATION: Used in DeliveryFeeDisplay component
 * FEATURES:
 *  - Shows delivery method icon and label
 *  - Displays fee amount or "Free" badge
 *  - Highlights available methods
 *  - Responsive card design
 *
 * USAGE:
 *  <DeliveryMethodCard
 *    method="personal"
 *    fee={5.0}
 *    enabled={true}
 *    isFree={false}
 *  />
 */
function DeliveryMethodCard({ method, fee, enabled, isFree = false }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Method configuration
  const methodConfig = {
    personal: {
      icon: <LocalShipping sx={{ fontSize: 28 }} />,
      label: "Personal Delivery",
      description: "Delivery to your address",
      color: theme.palette.primary.main,
    },
    campus: {
      icon: <School sx={{ fontSize: 28 }} />,
      label: "Campus Delivery",
      description: "Delivery to UiTM campus",
      color: theme.palette.secondary.main,
    },
    pickup: {
      icon: <Store sx={{ fontSize: 28 }} />,
      label: "Self Pickup",
      description: "Pick up from seller",
      color: theme.palette.info.main,
    },
  };

  const config = methodConfig[method] || methodConfig.personal;

  if (!enabled) {
    return null;
  }

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
          borderColor: config.color,
        },
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              color: config.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: `${config.color}15`,
              flexShrink: 0,
            }}
          >
            {config.icon}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
              }}
            >
              <Typography
                variant="subtitle1"
                component="h3"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {config.label}
              </Typography>
              {enabled && (
                <CheckCircle
                  sx={{
                    fontSize: 16,
                    color: theme.palette.success.main,
                  }}
                  aria-label="Available"
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, fontSize: "0.875rem" }}
            >
              {config.description}
            </Typography>

            {/* Fee Display */}
            <Box>
              {isFree ? (
                <Chip
                  label="FREE"
                  size="small"
                  color="success"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    color: config.color,
                    fontWeight: 700,
                  }}
                >
                  RM {fee.toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DeliveryMethodCard;
