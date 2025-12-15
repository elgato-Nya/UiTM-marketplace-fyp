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
      <Box
        sx={{
          py: { xs: 3, sm: 4, md: 5 },
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!merchants || merchants.length === 0) {
    return null; // Don't show section if no merchants
  }

  return (
    <Box
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
                letterSpacing: "-0.01em",
                color: theme.palette.text.primary,
              }}
            >
              Featured Merchants
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
              }}
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
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3 },
                    }}
                  >
                    {/* Merchant Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Avatar
                        src={merchant.avatar}
                        alt={shopName}
                        sx={{
                          width: { xs: 48, sm: 60 },
                          height: { xs: 48, sm: 60 },
                          mr: { xs: 1.5, sm: 2 },
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
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: "bold",
                              color: theme.palette.text.primary,
                              fontSize: { xs: "0.95rem", sm: "1.25rem" },
                            }}
                          >
                            {shopName}
                          </Typography>
                          {isVerified && (
                            <Star
                              sx={{
                                color: theme.palette.warning.main,
                                fontSize: { xs: 16, sm: 20 },
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
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
                        mb: { xs: 1.5, sm: 2 },
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5,
                        minHeight: { xs: 32, sm: 40 },
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {shopDescription}
                    </Typography>

                    {/* Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: { xs: 1.5, sm: 2 },
                      }}
                    >
                      {rating > 0 ? (
                        <>
                          <Rating
                            value={rating}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              ml: 1,
                              color: theme.palette.text.secondary,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {rating.toFixed(1)} ({reviews})
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                        justifyContent: "space-around",
                        mb: { xs: 1.5, sm: 3 },
                        py: { xs: 1, sm: 0 },
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: theme.palette.primary.main,
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          {totalProducts}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          }}
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
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          {formatViews(monthlyViews)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          }}
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
                      size={isVerified ? "medium" : "small"}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderWidth: 2,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        py: { xs: 0.5, sm: 1 },
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
    </Box>
  );
}

export default MerchantSpotlight;
