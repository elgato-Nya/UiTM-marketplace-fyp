import React, { useEffect } from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import {
  Security,
  School,
  Verified,
  TrendingUp,
  ArrowForward,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

const values = [
  {
    icon: Security,
    title: "Secure",
    desc: "Enterprise-grade security with verified transactions",
  },
  {
    icon: School,
    title: "Community",
    desc: "Built exclusively for the UiTM ecosystem",
  },
  {
    icon: Verified,
    title: "Trusted",
    desc: "Every merchant verified, every listing monitored",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    desc: "Empowering student entrepreneurs to succeed",
  },
];

const techStack = [
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "Material-UI",
  "Stripe",
  "AWS",
];

function AboutPage() {
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero */}
      <Box
        id="about"
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: { xs: 8, md: 14 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3.5rem" },
              mb: 2,
              letterSpacing: "-0.02em",
            }}
          >
            About MarKet
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            A trusted marketplace connecting the UiTM community through secure,
            seamless commerce.
          </Typography>
        </Container>
      </Box>

      {/* Story */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Box id="history" sx={{ textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            Our Story
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mt: 1,
              mb: 3,
              fontSize: { xs: "1.5rem", md: "2.25rem" },
            }}
          >
            Built for Students, By a Student
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.125rem" },
              maxWidth: 700,
              mx: "auto",
            }}
          >
            MarKet was born from a Final Year Project with a simple mission: to
            create a reliable, secure platform where the UiTM community can
            connect, trade, and support each other's entrepreneurial journey.
            What started as an academic project has grown into a comprehensive
            e-commerce solution designed specifically for our campus ecosystem.
          </Typography>
        </Box>
      </Container>

      {/* Values */}
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              display: "block",
              textAlign: "center",
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            What We Stand For
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mt: 1,
              mb: { xs: 4, md: 6 },
              fontSize: { xs: "1.5rem", md: "2.25rem" },
            }}
          >
            Our Core Values
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 3, md: 4 },
            }}
          >
            {values.map((v, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: "center",
                  p: { xs: 2, md: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "12px",
                    bgcolor: `${theme.palette.primary.main}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <v.icon
                    sx={{ color: theme.palette.primary.main, fontSize: 28 }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {v.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {v.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Container
        maxWidth="md"
        sx={{ py: { xs: 6, md: 10 }, textAlign: "center" }}
      >
        <Typography
          variant="overline"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          Technology
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            mt: 1,
            mb: 3,
            fontSize: { xs: "1.5rem", md: "2.25rem" },
          }}
        >
          Modern Stack, Reliable Performance
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "center",
            mb: 3,
          }}
        >
          {techStack.map((tech, i) => (
            <Chip
              key={i}
              label={tech}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Built with the MERN stack, secured with industry-standard practices.
        </Typography>
      </Container>

      {/* CTA */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: { xs: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
            Join our growing community of students and merchants.
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
              to={ROUTES.AUTH.REGISTER}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                fontWeight: 600,
                px: 4,
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
                borderColor: "white",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderColor: "white",
                },
                fontWeight: 600,
                px: 4,
              }}
            >
              Browse Listings
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default AboutPage;
