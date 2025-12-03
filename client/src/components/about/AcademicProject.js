import React from "react";
import { Container, Card, CardContent, Typography } from "@mui/material";
import { School } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function AcademicProject() {
  const { theme } = useTheme();

  return (
    <Container
      component="section"
      aria-labelledby="academic-project-title"
      maxWidth="lg"
      sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}
    >
      <Card
        component="article"
        elevation={3}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
          color: "white",
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 6 }, textAlign: "center" }}>
          <School
            aria-hidden="true"
            sx={{
              fontSize: { xs: 40, md: 60 },
              mb: { xs: 1, md: 2 },
              opacity: 0.9,
            }}
          />
          <Typography
            id="academic-project-title"
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: { xs: 1, md: 2 },
              fontSize: { xs: "1.25rem", md: "2.125rem" },
            }}
          >
            Final Year Project
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              maxWidth: 700,
              mx: "auto",
              lineHeight: { xs: 1.6, md: 1.8 },
              fontSize: { xs: "0.875rem", md: "1.125rem" },
              opacity: 0.95,
            }}
          >
            This marketplace platform was developed as a Final Year Project
            (FYP) for Universiti Teknologi MARA (UiTM). It represents the
            culmination of academic learning, combining modern web development
            practices, secure payment integration, and user-centered design to
            create a practical solution for the UiTM community.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default AcademicProject;
