import React from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import {
  ArrowForward,
  Storefront,
  ShoppingCart,
  Verified,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ROUTES } from "../../constants/routes";

function CTASection() {
  const { theme } = useTheme();
  const { isAuthenticated, isMerchant, isAdmin } = useAuth();

  const renderGuestCTA = () => (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 10 },
        mb: 4,
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
      }}
    >
      {/* Decorative gradient accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      />

      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          {/* Main heading */}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
              color: "text.primary",
            }}
          >
            Start Your Journey Today
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: 520,
              mx: "auto",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              lineHeight: 1.7,
            }}
          >
            Whether you're looking to discover unique products or grow your
            business, MarKet connects you with Malaysia's university community.
          </Typography>

          {/* Feature highlights */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 5 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <Verified sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="body2">Verified Merchants</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <ShoppingCart sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="body2">Secure Transactions</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <Storefront sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="body2">Campus-focused</Typography>
            </Box>
          </Stack>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              component={Link}
              to={ROUTES.AUTH.REGISTER}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minWidth: 180,
              }}
            >
              Create Account
            </Button>
            <Button
              component={Link}
              to={`${ROUTES.AUTH.REGISTER}?type=merchant`}
              variant="outlined"
              size="large"
              startIcon={<Storefront />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minWidth: 180,
              }}
            >
              Become a Seller
            </Button>
          </Stack>

          {/* Trust note */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 3,
              color: "text.disabled",
            }}
          >
            Free to join • No hidden fees • Cancel anytime
          </Typography>
        </Box>
      </Container>
    </Box>
  );

  const renderAuthenticatedCTA = () => {
    if (isAdmin) {
      return (
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            mb: 4,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            borderTop: `3px solid ${theme.palette.secondary.main}`,
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                Admin Dashboard
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: "text.secondary" }}
              >
                Monitor platform performance and manage the ecosystem
              </Typography>
              <Button
                component={Link}
                to={ROUTES.ADMIN.DASHBOARD}
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Open Dashboard
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
            py: { xs: 6, md: 8 },
            mb: 4,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            borderTop: `3px solid ${theme.palette.success.main}`,
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                Grow Your Business
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: "text.secondary" }}
              >
                Add new products and reach more customers today
              </Typography>
              <Button
                component={Link}
                to={ROUTES.MERCHANT.LISTINGS.CREATE}
                variant="contained"
                color="success"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Add New Listing
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }

    // Consumer CTA
    return (
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          mb: 4,
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          borderTop: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "text.primary",
              }}
            >
              Explore More
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
              Discover products and services from verified campus merchants
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                component={Link}
                to={ROUTES.LISTINGS.PRODUCTS}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Browse All
              </Button>
              <Button
                component={Link}
                to={`${ROUTES.AUTH.REGISTER}?type=merchant`}
                variant="outlined"
                size="large"
                startIcon={<Storefront />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Become a Seller
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  };

  return isAuthenticated ? renderAuthenticatedCTA() : renderGuestCTA();
}

export default CTASection;
