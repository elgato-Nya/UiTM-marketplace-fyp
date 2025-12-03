import React from "react";
import { Box, Container, Typography, Chip } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

function TechnologyStack() {
  const { theme } = useTheme();

  const technologies = [
    "React",
    "Node.js",
    "MongoDB",
    "Express",
    "Redux",
    "Material-UI",
    "Stripe",
    "AWS S3",
    "JWT Auth",
    "Tailwind CSS",
  ];

  return (
    <Box
      component="section"
      aria-labelledby="technology-stack-title"
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 3, md: 6 },
        mb: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Typography
          id="technology-stack-title"
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
          Built with Modern Technology
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
          Powered by industry-leading technologies for reliability and
          performance
        </Typography>

        <Box
          component="ul"
          role="list"
          aria-label="Technologies used"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            justifyContent: "center",
            mb: { xs: 2, md: 4 },
            listStyle: "none",
            p: 0,
            m: 0,
          }}
        >
          {technologies.map((tech, index) => (
            <Box component="li" key={index}>
              <Chip
                label={tech}
                color="primary"
                variant="outlined"
                sx={{
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  py: { xs: 1.5, md: 2.5 },
                  px: { xs: 0.5, md: 1 },
                  fontWeight: 500,
                }}
              />
            </Box>
          ))}
        </Box>

        <Typography
          variant="body1"
          component="p"
          sx={{
            textAlign: "center",
            color: theme.palette.text.secondary,
            maxWidth: 800,
            mx: "auto",
            lineHeight: { xs: 1.6, md: 1.8 },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          Our platform is built using the MERN stack (MongoDB, Express, React,
          Node.js) with additional integrations including Stripe for secure
          payments, AWS S3 for reliable file storage, and enterprise-grade
          security measures to protect your data and transactions.
        </Typography>
      </Container>
    </Box>
  );
}

export default TechnologyStack;
