import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  FormatQuote,
} from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";

const testimonials = [
  {
    id: 1,
    name: "Ahmad Zaki",
    role: "Computer Science Student",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "Amazing platform! I found all my textbooks at affordable prices and the delivery was super fast. Highly recommended for UiTM students!",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    role: "Business Student & Merchant",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "As a merchant, this platform helped me reach so many students. The interface is user-friendly and customer support is excellent!",
  },
  {
    id: 3,
    name: "Kumar Selvam",
    role: "Engineering Student",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 4.5,
    text: "Great marketplace for students. Found affordable electronics and even hired a tutor through the services section. Very convenient!",
  },
  {
    id: 4,
    name: "Fatimah Zahra",
    role: "Part-time Merchant",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "I started selling my handmade crafts here and the response has been overwhelming. Love the secure payment system!",
  },
];

function TestimonialsCarousel() {
  const { theme, isAccessible } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        py: 6,
        mb: 4,
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            What Our Community Says
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            Real experiences from students and merchants
          </Typography>
        </Box>

        {/* Testimonial Card */}
        <Card
          sx={{
            position: "relative",
            bgcolor: theme.palette.background.paper,
            border: isAccessible
              ? `2px solid ${theme.palette.primary.main}`
              : "none",
            boxShadow: isAccessible ? "none" : theme.shadows[8],
            overflow: "visible",
          }}
        >
          {/* Quote Icon */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: theme.palette.primary.main,
              color: "white",
              width: 60,
              height: 60,
              borderRadius: isAccessible ? 0 : "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: theme.shadows[4],
            }}
          >
            <FormatQuote sx={{ fontSize: 32 }} />
          </Box>

          <CardContent sx={{ pt: 6, pb: 4, px: { xs: 3, md: 6 } }}>
            {/* Rating */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Rating
                value={currentTestimonial.rating}
                precision={0.5}
                readOnly
                size="large"
              />
            </Box>

            {/* Testimonial Text */}
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: theme.palette.text.primary,
                fontStyle: "italic",
                mb: 3,
                lineHeight: 1.8,
                minHeight: { xs: "auto", md: 120 },
              }}
            >
              "{currentTestimonial.text}"
            </Typography>

            {/* Author Info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                sx={{
                  width: 80,
                  height: 80,
                  border: `3px solid ${theme.palette.primary.main}`,
                }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.text.primary,
                  }}
                >
                  {currentTestimonial.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {currentTestimonial.role}
                </Typography>
              </Box>
            </Box>
          </CardContent>

          {/* Navigation Arrows */}
          <IconButton
            onClick={prevTestimonial}
            sx={{
              position: "absolute",
              left: { xs: 8, md: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.main}`,
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                color: "white",
              },
            }}
          >
            <ArrowBackIos sx={{ ml: 0.5 }} />
          </IconButton>

          <IconButton
            onClick={nextTestimonial}
            sx={{
              position: "absolute",
              right: { xs: 8, md: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.main}`,
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                color: "white",
              },
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Card>

        {/* Dots Navigation */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 3,
          }}
        >
          {testimonials.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: isAccessible ? 0 : "50%",
                bgcolor:
                  index === currentIndex
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor:
                    index === currentIndex
                      ? theme.palette.primary.dark
                      : theme.palette.grey[500],
                },
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default TestimonialsCarousel;
