import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { ShoppingBag, Store, People, TrendingUp } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ROUTES } from "../../constants/routes";

function CTASection() {
  const { theme, isAccessible } = useTheme();
  const { isAuthenticated, isConsumer, isMerchant, isAdmin } = useAuth();

  const renderGuestCTA = () => (
    <Box
      sx={{
        bgcolor: "transparent",
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: theme.palette.primary.contrastText,
        py: 8,
        mb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid
            size={{ xs: 12, md: 6 }}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              Ready to Start?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                opacity: 0.9,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Join thousands of students and merchants in Malaysia's
              fastest-growing university marketplace
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                alignContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Button
                component={Link}
                to={ROUTES.AUTH.REGISTER}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: theme.palette.primary.main,
                  minWidth: 160,
                  "&:hover": {
                    bgcolor: theme.palette.grey[100],
                  },
                }}
              >
                Join Now
              </Button>
              <Button
                component={Link}
                to={`${ROUTES.AUTH.REGISTER}?type=merchant`}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  minWidth: 160,
                  "&:hover": {
                    borderColor: theme.palette.grey[200],
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Start Selling
              </Button>
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            aria-label="Platform Statistics"
            position={"relative"}
            width={"100%"}
          >
            <Grid
              container
              spacing={2}
              sx={{
                justifyContent: { xs: "center", md: "flex-start" },
                alignContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Grid
                size={{ xs: 6 }}
                sx={{
                  width: 150,
                }}
              >
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: isAccessible ? `1px solid white` : "none",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <ShoppingBag sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      10,000+
                    </Typography>
                    <Typography variant="body2">Products & Services</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ width: 150 }}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: isAccessible ? `1px solid white` : "none",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <People sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      5,000+
                    </Typography>
                    <Typography variant="body2">Active Users</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  const renderAuthenticatedCTA = () => {
    if (isAdmin) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            py: 6,
            mb: 4,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Platform Overview
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Monitor and manage the UiTM Marketplace ecosystem
              </Typography>
              <Button
                component={Link}
                to={ROUTES.ADMIN.DASHBOARD}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: theme.palette.secondary.main,
                  minWidth: 200,
                  "&:hover": {
                    bgcolor: theme.palette.grey[100],
                  },
                }}
              >
                Go to Admin Dashboard
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }

    if (isMerchant) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.success.main,
            color: "white",
            py: 6,
            mb: 4,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Boost Your Sales
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  List more products, analyze your performance, and reach more
                  customers
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: { xs: "center", md: "flex-end" },
                  }}
                >
                  <Button
                    component={Link}
                    to={ROUTES.MERCHANT.LISTINGS.CREATE}
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.success.main,
                      "&:hover": {
                        bgcolor: theme.palette.grey[100],
                      },
                    }}
                  >
                    Add Product
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      );
    }

    // Consumer CTA
    return (
      <Box
        sx={{
          bgcolor: theme.palette.info.main,
          color: "white",
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Discover More
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Explore our categories and find exactly what you need
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                to={ROUTES.LISTINGS.PRODUCTS}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: theme.palette.info.main,
                  minWidth: 160,
                  "&:hover": {
                    bgcolor: theme.palette.grey[100],
                  },
                }}
              >
                Browse All
              </Button>
              <Button
                component={Link}
                to={`${ROUTES.AUTH.REGISTER}?type=merchant`}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  minWidth: 160,
                  "&:hover": {
                    borderColor: theme.palette.grey[200],
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Start Selling Too
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  };

  return isAuthenticated ? renderAuthenticatedCTA() : renderGuestCTA();
}

export default CTASection;
