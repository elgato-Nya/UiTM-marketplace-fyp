import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Skeleton,
  alpha,
} from "@mui/material";
import { FormatQuote, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import api from "../../services/api/index";

/**
 * CustomerFeedbackSection Component
 *
 * PURPOSE: Display real customer feedback/testimonials on homepage
 * SOURCE: Public API endpoint /api/contact/public/testimonials
 * ACCESS: Public - visible to all users (authenticated and guests)
 */

function CustomerFeedbackSection() {
  const { theme, isDark } = useTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await api.get("/contact/public/testimonials", {
          params: { limit: 3 },
        });

        if (response.data.success && response.data.testimonials) {
          setTestimonials(response.data.testimonials);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Don't render if no testimonials
  if (!loading && testimonials.length === 0) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: isDark
          ? "background.default"
          : alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              fontSize: { xs: "1.75rem", md: "2.25rem" },
            }}
          >
            What Our Community Says
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: "auto" }}
          >
            Real feedback from students and merchants in our marketplace
          </Typography>
        </Box>

        {/* Testimonials Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{ p: 3, height: 280 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={18} />
                    </Box>
                  </Box>
                  <Skeleton width="50%" height={20} sx={{ mb: 2 }} />
                  <Skeleton height={18} />
                  <Skeleton height={18} />
                  <Skeleton width="80%" height={18} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={testimonial.id || index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 3,
                    bgcolor: isDark
                      ? alpha(theme.palette.background.paper, 0.6)
                      : theme.palette.background.paper,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                  }}
                >
                  {/* Quote Icon */}
                  <FormatQuote
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontSize: 32,
                      color: alpha(theme.palette.primary.main, 0.15),
                      transform: "rotate(180deg)",
                    }}
                  />

                  {/* User Info */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "primary.main",
                        fontSize: "1.25rem",
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(testimonial.name)}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(testimonial.date)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Rating */}
                  {testimonial.rating && (
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  {/* Title */}
                  {testimonial.title && (
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1.5 }}
                    >
                      {testimonial.title}
                    </Typography>
                  )}

                  {/* Message */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    "{testimonial.message}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* CTA */}
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            component={Link}
            to={ROUTES.CONTACT}
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            Share Your Experience
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default CustomerFeedbackSection;
