import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { EmojiEvents, VolunteerActivism, Support } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function OurCommitment() {
  const { theme } = useTheme();

  const teamCommitments = [
    {
      icon: <EmojiEvents />,
      title: "Student Empowerment",
      description:
        "Providing student entrepreneurs with the platform and tools they need to succeed in their business ventures.",
    },
    {
      icon: <VolunteerActivism />,
      title: "Fair Marketplace",
      description:
        "Ensuring equal opportunities for all sellers while maintaining competitive pricing and quality for buyers.",
    },
    {
      icon: <Support />,
      title: "Continuous Support",
      description:
        "Offering guidance, resources, and responsive assistance to help our community thrive and grow together.",
    },
  ];

  return (
    <Container
      component="section"
      aria-labelledby="our-commitment-title"
      maxWidth="lg"
      sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}
    >
      <Typography
        id="our-commitment-title"
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
        Our Commitment to You
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
        How we support and serve our community
      </Typography>

      <Grid
        container
        spacing={{ xs: 1.5, md: 4 }}
        role="list"
        aria-label="Our commitments"
      >
        {teamCommitments.map((commitment, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index} role="listitem">
            <Card
              component="article"
              elevation={3}
              sx={{
                height: "100%",
                borderRadius: { xs: 2, md: 3 },
                borderTop: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 4 }, textAlign: "center" }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    display: "inline-flex",
                    p: { xs: 1.5, md: 2.5 },
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    mb: { xs: 1.5, md: 3 },
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "30px", md: "40px" },
                    },
                  }}
                >
                  {commitment.icon}
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
                  {commitment.title}
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
                  {commitment.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default OurCommitment;
