import React from "react";
import { Container, Box, Typography, Button, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

function CallToAction() {
  const { theme } = useTheme();

  return (
    <>
      <Divider sx={{ mb: { xs: 3, md: 6 } }} role="separator" />
      <Container
        component="section"
        aria-labelledby="cta-title"
        maxWidth="md"
        sx={{ px: { xs: 2, md: 3 } }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            id="cta-title"
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: { xs: 1, md: 2 },
              color: theme.palette.primary.main,
              fontSize: { xs: "1.25rem", md: "2.125rem" },
            }}
          >
            Join Our Growing Community
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              mb: { xs: 2, md: 4 },
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.875rem", md: "1.125rem" },
              lineHeight: { xs: 1.6, md: 1.8 },
            }}
          >
            Whether you're looking to buy, sell, or trade, MarKet provides the
            tools and security you need. Start your journey today and be part of
            our thriving campus economy.
          </Typography>

          <Box
            component="nav"
            aria-label="Call to action buttons"
            sx={{
              display: "flex",
              gap: { xs: 1, md: 2 },
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              to={ROUTES.AUTH.REGISTER}
              variant="contained"
              size="large"
              sx={{
                minWidth: { xs: "auto", md: 180 },
                fontSize: { xs: "0.875rem", md: "1rem" },
                py: { xs: 1, md: 1.5 },
                px: { xs: 2, md: 4 },
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to={ROUTES.LISTINGS.ALL}
              variant="outlined"
              size="large"
              sx={{
                minWidth: { xs: "auto", md: 180 },
                fontSize: { xs: "0.875rem", md: "1rem" },
                py: { xs: 1, md: 1.5 },
                px: { xs: 2, md: 4 },
              }}
            >
              Browse Listings
            </Button>
            <Button
              component={Link}
              to={ROUTES.MERCHANT.BECOME}
              variant="outlined"
              color="warning"
              size="large"
              sx={{
                minWidth: { xs: "auto", md: 180 },
                fontSize: { xs: "0.875rem", md: "1rem" },
                py: { xs: 1, md: 1.5 },
                px: { xs: 2, md: 4 },
              }}
            >
              Become a Merchant
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default CallToAction;
