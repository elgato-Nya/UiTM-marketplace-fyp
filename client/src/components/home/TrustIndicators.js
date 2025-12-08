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
        console.log("Public stats response:", response);

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
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Why Choose UiTM Marketplace?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: "auto",
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
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
                key={feature.id}
                sx={{
                  height: 225,
                }}
              >
                <Card
                  sx={{
                    height: "100%",
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
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: `${colorValue}15`,
                        borderRadius: isAccessible ? 0 : "50%",
                        width: 80,
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        border: isAccessible
                          ? `2px solid ${colorValue}`
                          : "none",
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 40,
                          color: colorValue,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
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
