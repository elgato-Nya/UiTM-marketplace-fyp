import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import {
  Security,
  VerifiedUser,
  Support,
  LocalShipping,
  PaymentRounded,
  StarRate,
} from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import { getPublicStats } from "../../services/analyticsService";

/**
 * TrustIndicators Component
 *
 * PURPOSE: Display platform statistics and trust features to build credibility
 * CURRENT: Shows real-time platform stats (users, listings, merchants)
 *
 * TODO: Enhanced Transaction-Based Social Proof (Future Implementation)
 * =====================================================================
 * Once sufficient transactional data is available, enhance this component with:
 *
 * 1. REAL TRANSACTION METRICS:
 *    - Total completed orders/transactions
 *    - Success rate percentage (completed/total orders)
 *    - Total transaction volume (GMV - Gross Merchandise Value)
 *    - Average order fulfillment time
 *
 * 2. CUSTOMER SATISFACTION METRICS:
 *    - Average customer rating from order feedback
 *    - Percentage of 5-star ratings
 *    - Customer satisfaction score (from order ratings)
 *    - Repeat purchase rate
 *
 * 3. DELIVERY METRICS:
 *    - Average delivery time (calculated from orders)
 *    - On-time delivery rate
 *    - Campus delivery success rate
 *
 * 4. MERCHANT METRICS:
 *    - Average merchant response time
 *    - Top-rated merchants count (rating >= 4.5)
 *    - Verified merchant percentage
 *
 * 5. API ENDPOINT (to create):
 *    GET /api/analytics/public/transaction-stats
 *    Response: {
 *      totalOrders: number,
 *      completedOrders: number,
 *      successRate: number,
 *      averageRating: number,
 *      averageDeliveryDays: number,
 *      onTimeDeliveryRate: number,
 *      totalGMV: number
 *    }
 *
 * 6. DISPLAY STRATEGY:
 *    - Show transaction metrics alongside current platform stats
 *    - Use animated counters for impressive numbers
 *    - Add trend indicators (↑ 12% this month)
 *    - Implement real-time updates (refresh every 60s)
 *
 * WHY THIS MATTERS:
 * Enterprise marketplaces (Amazon, eBay, Shopify) prominently display
 * transaction metrics as they provide stronger social proof than user counts.
 * Real transaction data = platform is actively used and trusted.
 */

const notUsedForNow = [
  {
    id: 1,
    icon: Security,
    title: "Secure Transactions",
    description: "End-to-end encryption and secure payment processing",
    color: "success",
  },
  {
    id: 5,
    icon: PaymentRounded,
    title: "Multiple Payment Options",
    description: "Credit cards, e-wallets, and campus payment systems",
    color: "secondary",
  },
];

const trustFeatures = [
  {
    id: 2,
    icon: VerifiedUser,
    title: "Verified Merchants",
    description: "All sellers are verified UiTM community members",
    color: "primary",
  },
  {
    id: 3,
    icon: Support,
    title: "24/7 Support",
    description: "Round-the-clock customer service and dispute resolution",
    color: "info",
  },
  {
    id: 4,
    icon: LocalShipping,
    title: "Campus Delivery",
    description: "Fast and reliable delivery within campus premises",
    color: "warning",
  },
  {
    id: 6,
    icon: StarRate,
    title: "Quality Assurance",
    description: "Rating system and quality control for all listings",
    color: "error",
  },
];

function TrustIndicators() {
  const { theme, isAccessible } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getPublicStats();

        // Data is spread at root level (not nested in response.data)
        if (response.success) {
          setStats({
            totalUsers: response.totalUsers,
            totalListings: response.totalListings,
            totalMerchants: response.totalMerchants,
            activeMerchants: response.activeMerchants,
          });
        }
      } catch (error) {
        console.error("Error fetching public stats:", error);
        // Use fallback data if API fails
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format number with K suffix
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return `${num}+`;
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        py: 6,
        mb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4, md: 5 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              color: theme.palette.text.primary,
            }}
          >
            Why Choose MarKet?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.95rem", sm: "1.125rem", md: "1.25rem" },
              maxWidth: 600,
              mx: "auto",
              px: { xs: 2, sm: 0 },
            }}
          >
            Your trusted platform for safe, secure, and convenient campus
            commerce
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          justifyContent="center"
          alignItems="center"
          style={{ textAlign: "center" }}
        >
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;
            const colorValue =
              theme.palette[feature.color]?.main || theme.palette.primary.main;

            return (
              <Grid
                grow={1}
                size={{
                  xs: 6,
                  sm: 6,
                  md: 4,
                }}
                key={feature.id}
              >
                <Card
                  sx={{
                    height: "100%",
                    minHeight: { xs: 160, sm: 200, md: 225 },
                    bgcolor: theme.palette.background.paper,
                    border: isAccessible
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: isAccessible ? "none" : "translateY(-2px)",
                      boxShadow: isAccessible ? "none" : theme.shadows[4],
                      bgcolor: isAccessible
                        ? theme.palette.background.default
                        : theme.palette.background.paper,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: { xs: 2, sm: 2.5, md: 3 },
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: `${colorValue}15`,
                        borderRadius: isAccessible ? 0 : "50%",
                        width: { xs: 56, sm: 70, md: 80 },
                        height: { xs: 56, sm: 70, md: 80 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: { xs: 1.5, sm: 2 },
                        border: isAccessible
                          ? `2px solid ${colorValue}`
                          : "none",
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: { xs: 28, sm: 36, md: 40 },
                          color: colorValue,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: "bold",
                        mb: { xs: 0.5, sm: 0.75, md: 1 },
                        fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.25rem" },
                        color: theme.palette.text.primary,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5,
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8125rem",
                          md: "0.875rem",
                        },
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 2, md: 3 },
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Stats Section */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            bgcolor: theme.palette.primary.dark,
            borderRadius: isAccessible ? 0 : 2,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Grid container spacing={4} sx={{ textAlign: "center" }}>
            <Grid size={{ xs: 6, md: 3 }}>
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{
                    fontSize: "2.5rem",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  {formatNumber(stats?.totalUsers || 0)}
                </Typography>
              )}
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Active Users
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{
                    fontSize: "2.5rem",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  {formatNumber(stats?.totalMerchants || 0)}
                </Typography>
              )}
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Verified Merchants
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{
                    fontSize: "2.5rem",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  {formatNumber(stats?.totalListings || 0)}
                </Typography>
              )}
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Products Listed
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{
                    fontSize: "2.5rem",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  {formatNumber(stats?.activeMerchants || 0)}
                </Typography>
              )}
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Active Sellers
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default TrustIndicators;
