import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Chip,
  useMediaQuery,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  LocalShipping,
  ExpandMore,
  ExpandLess,
  Info,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { getListingDeliveryFees } from "../../services/merchantService";
import DeliveryMethodCard from "./DeliveryMethodCard";
import FreeDeliveryBadge from "./FreeDeliveryBadge";

/**
 * DeliveryFeeDisplay Component
 *
 * PURPOSE: Display delivery fee information for a listing
 * LOCATION: Integrated into ListingDetailPage
 * FEATURES:
 *  - Fetches delivery fees from backend
 *  - Shows available delivery methods
 *  - Displays free delivery threshold
 *  - Shows deliverable campuses (if campus delivery enabled)
 *  - Loading skeleton
 *  - Error handling
 *  - Collapsible campus list
 *
 * USAGE:
 *  <DeliveryFeeDisplay listingId={listing._id} />
 */
function DeliveryFeeDisplay({ listingId }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryFees, setDeliveryFees] = useState(null);
  const [campusListExpanded, setCampusListExpanded] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadDeliveryFees();
    }
  }, [listingId]);

  const loadDeliveryFees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getListingDeliveryFees(listingId);
      setDeliveryFees(response.data);
    } catch (err) {
      console.error("Error loading delivery fees:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load delivery information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if order qualifies for free delivery
  const checkFreeDelivery = (orderAmount) => {
    if (!deliveryFees?.freeDeliveryThreshold) return false;
    return orderAmount >= deliveryFees.freeDeliveryThreshold;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // No delivery fees configured
  if (!deliveryFees) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Delivery information not available for this listing.
      </Alert>
    );
  }

  const {
    personal,
    campus,
    pickup,
    freeDeliveryThreshold,
    deliverableCampuses,
  } = deliveryFees;

  // Check if any method is enabled
  const hasAnyMethod = personal?.enabled || campus?.enabled || pickup?.enabled;

  if (!hasAnyMethod) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No delivery methods available for this listing.
      </Alert>
    );
  }

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          <LocalShipping
            sx={{ fontSize: 28, color: theme.palette.primary.main }}
          />
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, flex: 1 }}
          >
            Delivery Options
          </Typography>
        </Box>

        {/* Free Delivery Badge */}
        {freeDeliveryThreshold > 0 && (
          <FreeDeliveryBadge threshold={freeDeliveryThreshold} />
        )}

        {/* Delivery Methods Grid */}
        <Grid container spacing={2}>
          {personal?.enabled && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <DeliveryMethodCard
                method="personal"
                fee={personal.fee}
                enabled={personal.enabled}
                isFree={false}
              />
            </Grid>
          )}

          {campus?.enabled && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <DeliveryMethodCard
                method="campus"
                fee={campus.fee}
                enabled={campus.enabled}
                isFree={false}
              />
            </Grid>
          )}

          {pickup?.enabled && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <DeliveryMethodCard
                method="pickup"
                fee={pickup.fee}
                enabled={pickup.enabled}
                isFree={false}
              />
            </Grid>
          )}
        </Grid>

        {/* Campus Delivery Information */}
        {campus?.enabled &&
          deliverableCampuses &&
          deliverableCampuses.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  p: 1.5,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                onClick={() => setCampusListExpanded(!campusListExpanded)}
                role="button"
                aria-expanded={campusListExpanded}
                aria-label="Toggle deliverable campuses list"
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Info sx={{ fontSize: 20, color: theme.palette.info.main }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Deliverable Campuses ({deliverableCampuses.length})
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label={campusListExpanded ? "Collapse" : "Expand"}
                >
                  {campusListExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={campusListExpanded}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {deliverableCampuses.map((campus) => (
                      <Chip
                        key={campus}
                        label={campus.replace("UiTM ", "")}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )}

        {/* Campus Delivery - All Campuses */}
        {campus?.enabled &&
          (!deliverableCampuses || deliverableCampuses.length === 0) && (
            <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                Campus delivery is available to{" "}
                <strong>all UiTM campuses</strong>.
              </Typography>
            </Alert>
          )}

        {/* Helper Text */}
        <Box
          sx={{
            mt: 3,
            p: 1.5,
            backgroundColor: theme.palette.info.light + "10",
            borderRadius: 1,
            borderLeft: `4px solid ${theme.palette.info.main}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, display: "block" }}
          >
            💡 Delivery fees will be calculated at checkout based on your
            selected method and order amount.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DeliveryFeeDisplay;
