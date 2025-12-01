import React from "react";
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
} from "@mui/material";
import { Store, TrendingUp, Star } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

const featuredMerchants = [
  {
    id: 1,
    name: "TechHub UiTM",
    description: "Your one-stop shop for electronics and gadgets",
    avatar:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 342,
    totalProducts: 156,
    monthlyViews: "12.5K",
    specialty: "Electronics",
    verified: true,
  },
  {
    id: 2,
    name: "Campus Books Corner",
    description: "Affordable textbooks and stationery for students",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviews: 198,
    totalProducts: 89,
    monthlyViews: "8.2K",
    specialty: "Books & Education",
    verified: true,
  },
  {
    id: 3,
    name: "Foodie Express",
    description: "Delicious meals delivered right to your dorm",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b32d95f5?w=100&h=100&fit=crop&crop=face",
    rating: 4.7,
    reviews: 267,
    totalProducts: 45,
    monthlyViews: "15.3K",
    specialty: "Food & Services",
    verified: true,
  },
];

function MerchantSpotlight() {
  const { theme, isAccessible } = useTheme();

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
        {featuredMerchants.map((merchant) => (
          <Grid size={{ xs: 12, md: 4 }} key={merchant.id}>
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
                    alt={merchant.name}
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  />
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
                        {merchant.name}
                      </Typography>
                      {merchant.verified && (
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
                      {merchant.specialty}
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
                  }}
                >
                  {merchant.description}
                </Typography>

                {/* Rating */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Rating
                    value={merchant.rating}
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
                    {merchant.rating} ({merchant.reviews} reviews)
                  </Typography>
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
                      {merchant.totalProducts}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Products
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.success.main,
                      }}
                    >
                      {merchant.monthlyViews}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Monthly Views
                    </Typography>
                  </Box>
                </Box>

                {/* Action Button */}
                <Button
                  component={Link}
                  to={`/merchants/${merchant.id}`}
                  variant="outlined"
                  fullWidth
                  startIcon={<Store />}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: `${theme.palette.primary.main}10`,
                    },
                  }}
                >
                  Visit Store
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
