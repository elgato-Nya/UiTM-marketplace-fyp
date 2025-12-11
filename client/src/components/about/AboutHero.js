import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

function AboutHero() {
  const { theme } = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="about-hero-title"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        py: { xs: 4, md: 10 },
        mb: { xs: 3, md: 6 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 2, md: 4 } }}>
          <Typography
            id="about-hero-title"
            variant="h2"
            component="h1"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", sm: "2.75rem", md: "3.5rem" },
              mb: { xs: 1, md: 2 },
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            About MarKet
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              maxWidth: 800,
              mx: "auto",
              opacity: 0.95,
              fontSize: { xs: "0.875rem", sm: "1.25rem", md: "1.5rem" },
              lineHeight: { xs: 1.5, md: 1.6 },
              px: { xs: 2, md: 0 },
            }}
          >
            Connecting the UiTM community through a trusted, secure, and
            innovative marketplace platform
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutHero;
