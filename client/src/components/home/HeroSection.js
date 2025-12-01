import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useMediaQuery,
  Fade,
  IconButton,
} from "@mui/material";
import { ROUTES } from "../../constants/routes";
import {
  ArrowBackIos,
  ArrowForwardIos,
  ShoppingBag,
  Store,
  SpaceDashboard,
  AdminPanelSettings,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";

const carouselImages = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
    title: "Discover Amazing Products",
    subtitle: "Shop from thousands of verified merchants",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop",
    title: "Start Your Business Today",
    subtitle: "Join our merchant community and reach more customers",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=400&fit=crop",
    title: "Services & Products",
    subtitle: "Find what you need, from products to professional services",
  },
];

function HeroSection() {
  const { theme, isDark, isAccessible } = useTheme();
  const { isAuthenticated, user, isMerchant, isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    ); // added + carouselImages.length to avoid negative value
  };

  const renderAuthenticatedContent = () => {
    if (isAdmin) {
      return (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <Button
            component={Link}
            to={ROUTES.ADMIN.DASHBOARD}
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={!isMobile && <AdminPanelSettings />}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              "&:hover": {
                bgcolor: theme.palette.secondary.dark,
              },
            }}
          >
            {isMobile ? "Admin" : "Admin Dashboard"}
          </Button>
          <Button
            component={Link}
            to={ROUTES.LISTINGS.PRODUCTS}
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            startIcon={!isMobile && <ShoppingBag />}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderColor: theme.palette.primary.light,
              color: "white",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Browse
          </Button>
        </Box>
      );
    }

    if (isMerchant) {
      return (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <Button
            component={Link}
            to={ROUTES.MERCHANT.INDEX}
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={!isMobile && <SpaceDashboard />}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              bgcolor: theme.palette.success.main,
              "&:hover": {
                bgcolor: theme.palette.success.dark,
              },
            }}
          >
            {isMobile ? "Dashboard" : "Merchant Dashboard"}
          </Button>
          <Button
            component={Link}
            to={ROUTES.LISTINGS.PRODUCTS}
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            startIcon={!isMobile && <ShoppingBag />}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderColor: theme.palette.primary.light,
              color: "white",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Browse
          </Button>
        </Box>
      );
    }

    // Default for consumers
    return (
      <Box
        sx={{
          mt: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: { xs: "center", md: "flex-start" },
        }}
      >
        <Button
          component={Link}
          to={ROUTES.LISTINGS.PRODUCTS}
          variant="contained"
          size={isMobile ? "medium" : "large"}
          startIcon={!isMobile && <ShoppingBag />}
          sx={{
            minWidth: { xs: 140, sm: 160 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Browse
        </Button>
        <Button
          component={Link}
          to={`${ROUTES.AUTH.REGISTER}?type=merchant`}
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          startIcon={!isMobile && <Store />}
          sx={{
            minWidth: { xs: 140, sm: 160 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            borderColor: theme.palette.warning.main,
            color: theme.palette.warning.main,
            "&:hover": {
              borderColor: theme.palette.warning.dark,
              bgcolor: "rgba(255,215,0,0.1)",
            },
          }}
        >
          {isMobile ? "Sell" : "Become a Merchant"}
        </Button>
      </Box>
    );
  };

  const renderGuestContent = () => (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: { xs: "center", md: "flex-start" },
      }}
    >
      <Button
        component={Link}
        to={ROUTES.AUTH.REGISTER}
        variant="contained"
        size={isMobile ? "medium" : "large"}
        sx={{
          minWidth: { xs: 100, sm: 120 },
          fontSize: { xs: "0.875rem", sm: "1rem" },
          bgcolor: theme.palette.primary.main,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      >
        Join Now
      </Button>
      <Button
        component={Link}
        to={ROUTES.LISTINGS.PRODUCTS}
        variant="outlined"
        size={isMobile ? "medium" : "large"}
        sx={{
          minWidth: { xs: 100, sm: 120 },
          fontSize: { xs: "0.875rem", sm: "1rem" },
          borderColor: theme.palette.primary.light,
          color: "white",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        Browse
      </Button>
      <Button
        component={Link}
        to={ROUTES.AUTH.LOGIN}
        variant="text"
        size={isMobile ? "medium" : "large"}
        sx={{
          minWidth: { xs: 80, sm: 100 },
          fontSize: { xs: "0.875rem", sm: "1rem" },
          color: theme.palette.warning.main,
          "&:hover": {
            bgcolor: "rgba(255,215,0,0.1)",
          },
        }}
      >
        Login
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: 400, sm: 450, md: 500 },
        overflow: "hidden",
        mb: 4,
      }}
    >
      {/* Carousel Images */}
      {carouselImages.map((slide, index) => (
        <Fade key={slide.id} in={index === currentSlide} timeout={500}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: index === currentSlide ? "flex" : "none",
              alignItems: "center",
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  color: "white",
                  maxWidth: { xs: "100%", sm: 500, md: 600 },
                  textAlign: { xs: "center", md: "left" },
                  px: { xs: 2, sm: 0 },
                }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {isAuthenticated
                    ? `Welcome back, ${user?.profile?.username || "User"}!`
                    : slide.title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontSize: { xs: "0.95rem", sm: "1.25rem", md: "1.5rem" },
                    opacity: 0.9,
                    lineHeight: 1.4,
                  }}
                >
                  {slide.subtitle}
                </Typography>

                {isAuthenticated
                  ? renderAuthenticatedContent()
                  : renderGuestContent()}
              </Box>
            </Container>
          </Box>
        </Fade>
      ))}

      {/* Navigation Arrows */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: isAccessible
            ? theme.palette.text.primary
            : "rgba(0,0,0,0.3)",
          border: isAccessible
            ? `2px solid ${theme.palette.primary.main}`
            : "none",
          "&:hover": {
            bgcolor: isAccessible
              ? theme.palette.text.secondary
              : "rgba(0,0,0,0.5)",
          },
        }}
      >
        <ArrowBackIos />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: isAccessible
            ? theme.palette.text.primary
            : "rgba(0,0,0,0.3)",
          border: isAccessible
            ? `2px solid ${theme.palette.primary.main}`
            : "none",
          "&:hover": {
            bgcolor: isAccessible
              ? theme.palette.text.secondary
              : "rgba(0,0,0,0.5)",
          },
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* Dots Navigation in Slide */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {carouselImages.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: isAccessible ? 0 : "50%",
              bgcolor:
                index === currentSlide
                  ? theme.palette.primary.main
                  : "rgba(255,255,255,0.5)",
              border: isAccessible
                ? `2px solid ${theme.palette.primary.main}`
                : "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default HeroSection;
