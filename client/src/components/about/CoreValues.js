import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { Security, School, Verified, TrendingUp } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function CoreValues() {
  const { theme } = useTheme();

  const coreValues = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Trust & Security",
      description:
        "Your safety is paramount. We implement industry-leading security measures, verified merchant accounts, and secure payment processing to protect every transaction.",
    },
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: "Community First",
      description:
        "Built exclusively for the UiTM community, connecting students, faculty, and staff across all campuses in a trusted marketplace environment.",
    },
    {
      icon: <Verified sx={{ fontSize: 40 }} />,
      title: "Quality Assurance",
      description:
        "Every merchant is verified, every listing is monitored, and every transaction is protected to ensure the highest quality experience.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: "Innovation & Growth",
      description:
        "Empowering student entrepreneurs with modern e-commerce tools, analytics, and resources to grow their businesses successfully.",
    },
  ];

  return (
    <Container
      component="section"
      aria-labelledby="core-values-title"
      maxWidth="lg"
      sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}
    >
      <Typography
        id="core-values-title"
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
        Our Core Values
      </Typography>
      <Typography
        variant="body1"
        component="p"
        sx={{
          textAlign: "center",
          mb: { xs: 2, md: 4 },
          color: theme.palette.text.secondary,
          maxWidth: 700,
          mx: "auto",
          fontSize: { xs: "0.875rem", md: "1rem" },
        }}
      >
        The principles that guide everything we do
      </Typography>

      <Grid
        container
        spacing={{ xs: 1.5, md: 3 }}
        role="list"
        aria-label="Core values"
      >
        {coreValues.map((value, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index} role="listitem">
            <Card
              component="article"
              elevation={2}
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
              <CardContent sx={{ p: { xs: 1.5, md: 3 }, textAlign: "center" }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    display: "inline-flex",
                    p: { xs: 1, md: 2 },
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    mb: { xs: 1, md: 2 },
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "24px", md: "40px" },
                    },
                  }}
                >
                  {value.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: "0.875rem", md: "1.25rem" },
                  }}
                >
                  {value.title}
                </Typography>
                <Typography
                  variant="body2"
                  component="p"
                  color="text.secondary"
                  sx={{
                    lineHeight: { xs: 1.5, md: 1.7 },
                    fontSize: { xs: "0.7rem", md: "0.875rem" },
                  }}
                >
                  {value.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CoreValues;
