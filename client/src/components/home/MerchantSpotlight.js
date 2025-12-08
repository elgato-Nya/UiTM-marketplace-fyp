import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Store, Star } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import { useDispatch } from "react-redux";
import { searchMerchants } from "../../features/merchant/store/merchantSlice";

function MerchantSpotlight() {
  const { theme, isAccessible } = useTheme();
  const dispatch = useDispatch();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedMerchants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch top merchants sorted by rating and sales
        // Don't send 'q' parameter at all to get all merchants (validator rejects empty string)
        const response = await dispatch(
          searchMerchants({
            limit: 10, // Fetch more to ensure we get at least 3
            page: 1,
          })
        ).unwrap();

        if (response.merchants) {
          // Take only first 3 merchants
          const featuredMerchants = response.merchants.slice(0, 3);
          console.log("Featured Merchants Data:", featuredMerchants);
          setMerchants(featuredMerchants);
        } else {
          setMerchants([]);
        }
      } catch (err) {
        console.error("Error fetching featured merchants:", err);
        setError("Unable to load featured merchants");
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMerchants();
  }, [dispatch]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 6, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mb: 6, px: { xs: 2, sm: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!merchants || merchants.length === 0) {
    return null; // Don't show section if no merchants
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 6, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 1,
              color: theme.palette.text.primary,
            }}
          >
            Featured Merchants
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            Discover trusted sellers in our community
          </Typography>
        </Box>

        <Button
          component={Link}
          to={ROUTES.MERCHANTS.DIRECTORY}
          variant="outlined"
          sx={{
            display: { xs: "none", sm: "flex" },
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              bgcolor: `${theme.palette.primary.main}10`,
            },
          }}
        >
          View All Merchants
        </Button>
      </Box>

      <Grid container spacing={3}>
        {merchants.map((merchantData) => {
          const { merchant, shop } = merchantData;
          const shopName = shop?.shopName || `${merchant.username}'s Shop`;
          const shopDescription =
            shop?.shopDescription || "Welcome to our shop!";
          const rating = shop?.shopRating?.averageRating || 0;
          const reviews = shop?.shopRating?.totalReviews || 0;
          const totalProducts = shop?.shopMetrics?.totalProducts || 0;
          const monthlyViews = shop?.shopMetrics?.totalViews || 0;
          const isVerified = shop?.isUiTMVerified || false;
          // Use shop slug for the URL - matches backend's sellerProfileUrl format
          const shopSlug = shop?.shopSlug || `${merchant.username}-shop`;
          const shopUrl = `/shop/${shopSlug}`;

          // Format views
          const formatViews = (views) => {
            if (views >= 1000) {
              return `${(views / 1000).toFixed(1)}K`;
            }
            return views.toString();
          };

          return (
            <Grid size={{ xs: 12, md: 4 }} key={shopSlug}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: theme.palette.background.paper,
                  border: isAccessible
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: isAccessible ? "none" : "translateY(-4px)",
                    boxShadow: isAccessible ? "none" : theme.shadows[8],
                    bgcolor: isAccessible
                      ? theme.palette.background.default
                      : theme.palette.background.paper,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Merchant Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={merchant.avatar}
                      alt={shopName}
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 2,
                        border: `2px solid ${theme.palette.primary.main}`,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {shopName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: "bold",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {shopName}
                        </Typography>
                        {isVerified && (
                          <Star
                            sx={{
                              color: theme.palette.warning.main,
                              fontSize: 20,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          fontWeight: "medium",
                        }}
                      >
                        @{merchant.username}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: theme.palette.text.secondary,
                      lineHeight: 1.5,
                      minHeight: 40,
                    }}
                  >
                    {shopDescription}
                  </Typography>

                  {/* Rating */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    {rating > 0 ? (
                      <>
                        <Rating
                          value={rating}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            ml: 1,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {rating.toFixed(1)} ({reviews} reviews)
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                        }}
                      >
                        No reviews yet
                      </Typography>
                    )}
                  </Box>

                  {/* Stats */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                        }}
                      >
                        {totalProducts}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Listings
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.secondary.main,
                        }}
                      >
                        {formatViews(monthlyViews)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Views
                      </Typography>
                    </Box>
                  </Box>

                  {/* Visit Store Button */}
                  <Button
                    component={Link}
                    to={shopUrl}
                    fullWidth
                    variant="outlined"
                    startIcon={<Store />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: `${theme.palette.primary.main}10`,
                      },
                    }}
                  >
                    Visit Store
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mobile View All Button */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          textAlign: "center",
          mt: 3,
        }}
      >
        <Button
          component={Link}
          to={ROUTES.MERCHANTS.DIRECTORY}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              bgcolor: `${theme.palette.primary.main}10`,
            },
          }}
        >
          View All Merchants
        </Button>
      </Box>
    </Container>
  );
}

export default MerchantSpotlight;
