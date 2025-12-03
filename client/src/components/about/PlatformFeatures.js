import React from "react";
import { Box, Container, Typography, Grid, Avatar } from "@mui/material";
import {
  Store,
  Payment,
  LocalShipping,
  Support,
  Security,
  Verified,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function PlatformFeatures() {
  const { theme } = useTheme();

  const platformFeatures = [
    {
      icon: <Store />,
      title: "Merchant Dashboard",
      description:
        "Comprehensive analytics, inventory management, and order tracking for sellers",
    },
    {
      icon: <Payment />,
      title: "Secure Payments",
      description:
        "Multiple payment options including FPX, Cards, GrabPay, and Cash on Delivery",
    },
    {
      icon: <LocalShipping />,
      title: "Flexible Delivery",
      description:
        "Campus-specific logistics with multiple address management and delivery options",
    },
    {
      icon: <Support />,
      title: "24/7 Support",
      description:
        "Dedicated customer service team ready to assist buyers and sellers",
    },
    {
      icon: <Security />,
      title: "Data Protection",
      description:
        "Enterprise-grade security with encryption and privacy compliance",
    },
    {
      icon: <Verified />,
      title: "Verified Accounts",
      description:
        "UiTM email verification ensures a trusted community of users",
    },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="platform-features-title"
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 3, md: 6 },
        mb: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Typography
          id="platform-features-title"
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
            mb: { xs: 0.5, md: 1 },
            textAlign: "center",
            color: theme.palette.primary.main,
            fontSize: { xs: "1.25rem", md: "2.125rem" },
          }}
        >
          What We Offer
        </Typography>
        <Typography
          variant="body1"
          component="p"
          sx={{
            textAlign: "center",
            mb: { xs: 3, md: 5 },
            color: theme.palette.text.secondary,
            maxWidth: 700,
            mx: "auto",
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          Comprehensive features designed for modern e-commerce
        </Typography>

        <Grid
          container
          spacing={{ xs: 1.5, md: 3 }}
          component="ul"
          role="list"
          aria-label="Platform features"
          sx={{ listStyle: "none", p: 0, m: 0 }}
        >
          {platformFeatures.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} component="li">
              <Box
                component="article"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  p: { xs: 1, md: 2 },
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <Avatar
                  aria-hidden="true"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    mr: { xs: 1, md: 2 },
                    mt: 0.5,
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "18px", md: "24px" },
                    },
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: "bold",
                      mb: 0.5,
                      fontSize: { xs: "0.875rem", md: "1.25rem" },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="p"
                    color="text.secondary"
                    sx={{
                      lineHeight: { xs: 1.4, md: 1.6 },
                      fontSize: { xs: "0.7rem", md: "0.875rem" },
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default PlatformFeatures;
