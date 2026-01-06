import React from "react";
import { Box, Container, Typography, Chip, IconButton } from "@mui/material";
import {
  Code,
  Security,
  Speed,
  Lightbulb,
  GitHub,
  Email,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { Logo } from "../../components/common/Logo";

const expertise = [
  { icon: Code, label: "Full-Stack Development" },
  { icon: Security, label: "Security & Privacy" },
  { icon: Speed, label: "Performance" },
  { icon: Lightbulb, label: "System Design" },
];

const techStack = ["React", "Node.js", "MongoDB", "Express", "AWS", "Stripe"];

function NekodezPage() {
  const { theme } = useTheme();

  return (
    <Box sx={{ width: "100%", minHeight: "100vh" }}>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: { xs: 8, md: 14 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ mb: 3 }}>
            <Logo
              variant="stacked"
              type="brand"
              height={{ xs: 100, md: 140 }}
              sx={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              opacity: 0.9,
              mb: 3,
              letterSpacing: 1,
            }}
          >
            Developer · Creator · Innovator
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["MERN Stack", "Cloud", "Security"].map((tag, i) => (
              <Chip
                key={i}
                label={tag}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 500,
                  backdropFilter: "blur(10px)",
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* About */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            About
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
            Building Digital Solutions
          </Typography>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.9,
            fontSize: { xs: "1rem", md: "1.125rem" },
            textAlign: "center",
            mb: 3,
          }}
        >
          Nekodez is a full-stack developer with a passion for building clean,
          scalable, and secure applications. Specializing in the MERN stack, the
          focus is on creating solutions that are not just functional, but
          genuinely helpful to real users.
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.9,
            fontSize: { xs: "1rem", md: "1.125rem" },
            textAlign: "center",
          }}
        >
          From authentication systems to cloud-ready services, every feature is
          approached with an emphasis on architecture, data integrity, and
          long-term maintainability.
        </Typography>
      </Container>

      {/* Expertise */}
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
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
            Expertise
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
            Areas of Focus
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {expertise.map((item, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: "center",
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    bgcolor: `${theme.palette.primary.main}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  <item.icon
                    sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                  }}
                >
                  {item.label}
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
          Tools of Choice
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "center",
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
      </Container>

      {/* Mission */}
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
            variant="overline"
            sx={{ opacity: 0.8, letterSpacing: 2 }}
          >
            Mission
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              mt: 2,
              lineHeight: 1.6,
              fontStyle: "italic",
              fontSize: { xs: "1.125rem", md: "1.5rem" },
            }}
          >
            "To build meaningful, reliable, and future-proof digital products
            while growing as a developer and as a person."
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 1 }}
          >
            <IconButton
              href="https://github.com/elgato-nya"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
              aria-label="GitHub"
            >
              <GitHub />
            </IconButton>
            <IconButton
              href="mailto:nekodez@example.com"
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
              aria-label="Email"
            >
              <Email />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default NekodezPage;
