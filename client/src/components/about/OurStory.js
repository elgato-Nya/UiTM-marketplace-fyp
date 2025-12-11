import React from "react";
import { Container, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

function OurStory() {
  const { theme } = useTheme();

  return (
    <Container
      component="section"
      aria-labelledby="our-story-title"
      maxWidth="lg"
      sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}
    >
      <Card
        component="article"
        elevation={3}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 5 } }}>
          <Typography
            id="our-story-title"
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: { xs: 2, md: 3 },
              textAlign: "center",
              color: theme.palette.primary.main,
              fontSize: { xs: "1.25rem", md: "2.125rem" },
            }}
          >
            Our Story
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              fontSize: { xs: "0.875rem", md: "1.125rem" },
              lineHeight: { xs: 1.6, md: 1.8 },
              textAlign: "center",
              maxWidth: 900,
              mx: "auto",
              mb: { xs: 2, md: 3 },
            }}
          >
            MarKet was born from a simple observation: students, faculty, and
            staff across campuses needed a reliable, secure platform to connect,
            trade, and support each other's entrepreneurial endeavors.
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              fontSize: { xs: "0.875rem", md: "1.125rem" },
              lineHeight: { xs: 1.6, md: 1.8 },
              textAlign: "center",
              maxWidth: 900,
              mx: "auto",
            }}
          >
            What started as a Final Year Project has evolved into a
            comprehensive e-commerce solution designed specifically for our
            community. We recognized the need for a trusted marketplace where
            students could sell textbooks, offer tutoring services, and grow
            their small businesses in a safe, monitored environment.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default OurStory;
