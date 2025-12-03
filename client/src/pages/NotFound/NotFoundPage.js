import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Home,
  SearchOff,
  Error,
  ArrowBack,
  Explore,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

function NotFoundPage() {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          animation: "drift 20s linear infinite",
        },
        "@keyframes drift": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "100%": {
            transform: "translate(50px, 50px)",
          },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={10}
          sx={{
            my: { xs: 2, md: 4 },
            p: { xs: 4, md: 8 },
            borderRadius: 1,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            backdropFilter: "blur(10px)",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Animated Error Icon */}
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: 200, md: 300 },
                height: { xs: 200, md: 300 },
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.palette.error.main}20 0%, transparent 70%)`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <Error
              sx={{
                fontSize: { xs: 120, md: 180 },
                color: theme.palette.error.main,
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": {
                    transform: "translateY(0px)",
                  },
                  "50%": {
                    transform: "translateY(-20px)",
                  },
                },
                "@keyframes pulse": {
                  "0%, 100%": {
                    opacity: 0.5,
                    transform: "translate(-50%, -50%) scale(1)",
                  },
                  "50%": {
                    opacity: 1,
                    transform: "translate(-50%, -50%) scale(1.1)",
                  },
                },
              }}
            />
          </Box>

          {/* 404 Text */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "4rem", md: "8rem" },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            404
          </Typography>

          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", md: "3rem" },
              color: theme.palette.text.primary,
            }}
          >
            Page Not Found
          </Typography>

          {/* Description */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 4,
            }}
          >
            <SearchOff
              sx={{ color: theme.palette.text.secondary, fontSize: 24 }}
            />
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              Oops! The page you're looking for doesn't exist.
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 6,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.8,
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            It seems you've ventured into uncharted territory. The page might
            have been moved, deleted, or perhaps it never existed. Let's get you
            back on track!
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              to={ROUTES.HOME}
              variant="contained"
              size="large"
              startIcon={<Home />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 0.5,
                textTransform: "none",
                boxShadow: 4,
                "&:hover": {
                  boxShadow: 8,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Go Home
            </Button>

            <Button
              component={Link}
              to={ROUTES.LISTINGS.ALL}
              variant="outlined"
              size="large"
              startIcon={<Explore />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 0.5,
                textTransform: "none",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Browse Listings
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="text"
              size="large"
              startIcon={<ArrowBack />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 1,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: "all 0.3s ease",
              }}
            >
              Go Back
            </Button>
          </Box>

          {/* Footer Message */}
          <Box
            sx={{
              pt: 4,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.8rem", md: "0.9rem" },
              }}
            >
              Need help?{" "}
              <Link
                to="/contact"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Contact Support
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default NotFoundPage;
