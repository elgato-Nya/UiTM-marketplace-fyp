import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Lightbulb, RocketLaunch, People } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function OurVision() {
  const { theme } = useTheme();

  const visionPoints = [
    {
      icon: <Lightbulb sx={{ fontSize: 50 }} />,
      title: "Innovation",
      description:
        "To continuously evolve with cutting-edge technology, providing the UiTM community with modern tools for digital commerce and entrepreneurship.",
    },
    {
      icon: <RocketLaunch sx={{ fontSize: 50 }} />,
      title: "Growth",
      description:
        "To expand across all UiTM campuses, creating opportunities for thousands of students to start and grow their businesses successfully.",
    },
    {
      icon: <People sx={{ fontSize: 50 }} />,
      title: "Community",
      description:
        "To foster a thriving ecosystem where students, faculty, and staff can collaborate, trade, and support one another in a trusted environment.",
    },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="our-vision-title"
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 3, md: 6 },
        mb: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Typography
          id="our-vision-title"
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
          Our Vision
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
            fontSize: { xs: "0.875rem", md: "1.125rem" },
            lineHeight: { xs: 1.6, md: 1.8 },
          }}
        >
          We envision a future where every UiTM student has access to a secure,
          reliable platform to pursue their entrepreneurial dreams and build
          successful businesses.
        </Typography>

        <Grid
          container
          spacing={{ xs: 1.5, md: 4 }}
          role="list"
          aria-label="Vision points"
        >
          {visionPoints.map((point, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index} role="listitem">
              <Card
                component="article"
                elevation={3}
                sx={{
                  height: "100%",
                  borderRadius: { xs: 2, md: 3 },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 4 }, textAlign: "center" }}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: "inline-flex",
                      p: { xs: 1, md: 2 },
                      borderRadius: "50%",
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      mb: { xs: 1.5, md: 3 },
                      "& .MuiSvgIcon-root": {
                        fontSize: { xs: "30px", md: "50px" },
                      },
                    }}
                  >
                    {point.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: "bold",
                      mb: { xs: 1, md: 2 },
                      fontSize: { xs: "1rem", md: "1.5rem" },
                    }}
                  >
                    {point.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="p"
                    color="text.secondary"
                    sx={{
                      lineHeight: { xs: 1.5, md: 1.8 },
                      fontSize: { xs: "0.75rem", md: "1rem" },
                    }}
                  >
                    {point.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default OurVision;
