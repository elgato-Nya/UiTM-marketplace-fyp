import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Code,
  Psychology,
  Lightbulb,
  Speed,
  Security,
  CloudDone,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function NekodezPage() {
  const { theme } = useTheme();

  const expertise = [
    {
      icon: <Code />,
      title: "Full-Stack Development",
      color: theme.palette.primary.main,
    },
    {
      icon: <Security />,
      title: "Security & Privacy",
      color: theme.palette.error.main,
    },
    {
      icon: <Speed />,
      title: "Performance Optimization",
      color: theme.palette.warning.main,
    },
    {
      icon: <Lightbulb />,
      title: "System Design",
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh" }}>
      {/* Hero Section with Gradient */}
      <Box
        sx={{
          position: "relative",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                mx: "auto",
                mb: 3,
                fontSize: { xs: "3rem", md: "4rem" },
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "4px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              🐱
            </Avatar>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              Nekodez
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                opacity: 0.95,
                fontWeight: 300,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Developer • Creator • Innovator
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                label="MERN Stack"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              />
              <Chip
                label="Cloud Enthusiast"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              />
              <Chip
                label="Security Focused"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4}>
          {/* Bio Card */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={4}
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: theme.palette.primary.main,
                  }}
                >
                  About Nekodez
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: { xs: "0.75rem", md: "1.1rem" },
                    textAlign: "justify",
                  }}
                >
                  Nekodez is a full-stack developer with a deep curiosity for
                  how things work. From the internals of modern web systems to
                  the subtle details of user experience. Blending creativity
                  with analytical thinking, Nekodez builds solutions that are
                  clean, scalable, secure, and genuinely helpful to real users.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: { xs: "0.75rem", md: "1.1rem" },
                    textAlign: "justify",
                  }}
                >
                  With strong experience in the MERN stack (MongoDB, Express,
                  React, Node.js), Nekodez focuses on crafting robust
                  applications such as campus-centric e-commerce platforms,
                  authentication systems, and cloud-ready services. Every
                  feature is approached with an emphasis on architecture, data
                  integrity, and long-term maintainability.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: { xs: "0.75rem", md: "1.1rem" },
                    textAlign: "justify",
                  }}
                >
                  Security and system design play a major role in the
                  development philosophy. From proper access control to token
                  flows and deployment practices, the goal is always to build
                  platforms that are dependable and production-ready, not just
                  “working.”
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: { xs: "0.75rem", md: "1.1rem" },
                    textAlign: "justify",
                  }}
                >
                  Nekodez is also a believer in constant improvement. Whether
                  it’s learning new backend strategies, exploring cloud
                  services, experimenting with CI/CD, or understanding how AI
                  enhances developer workflows, the journey never stops.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Card */}
          {/*
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={4}
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}
                >
                  Highlights
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 800, mb: 1, opacity: 0.9 }}
                    >
                      2
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Years Experience
                    </Typography>
                  </Box>
                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 800, mb: 1, opacity: 0.9 }}
                    >
                      50+
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Projects Delivered
                    </Typography>
                  </Box>
                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 800, mb: 1, opacity: 0.9 }}
                    >
                      100%
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Client Satisfaction
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          */}
        </Grid>

        {/* Mission Statement */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Card
            elevation={4}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: "white",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 6 }, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 3, opacity: 0.95 }}
              >
                Mission
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  opacity: 0.95,
                }}
              >
                "To build meaningful, reliable, and future-proof digital
                products while growing as a developer and as a person."
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Expertise Section */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: "center",
              color: theme.palette.primary.main,
            }}
          >
            Areas of Expertise
          </Typography>
          <Grid container spacing={3}>
            {expertise.map((item, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "100%",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    border: `2px solid transparent`,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      borderColor: item.color,
                      boxShadow: `0 12px 24px ${item.color}40`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: `${item.color}20`,
                      color: item.color,
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: item.color }}
                  >
                    {item.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default NekodezPage;
