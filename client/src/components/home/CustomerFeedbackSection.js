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
  Alert,
} from "@mui/material";
import { FormatQuote, RateReview, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import api from "../../services/api/index";

/**
 * CustomerFeedbackSection Component
 *
 * PURPOSE: Display real customer feedback and positive enquiry responses
 * SOURCES: Contact form submissions (type: feedback/enquiry)
 * DISPLAY LIMIT: 3 feedback cards maximum for homepage (prevents UI break)
 *
 * DESIGN DECISIONS:
 * =================
 * Q: How many feedback cards to show?
 * A: 3 cards maximum on homepage
 *    - Professional layouts typically show 3 testimonials (Amazon, Shopify, etc.)
 *    - Creates balanced visual layout (3 columns)
 *    - Prevents overwhelming the user
 *    - Maintains fast page load
 *
 * Q: What if there are hundreds of feedbacks?
 * A: Show only the 3 most recent/relevant:
 *    - Sort by: Most recent first (createdAt: -1)
 *    - Future: Add "View All Reviews" page with pagination
 *    - Future: Rotate displayed feedback (show different ones each visit)
 *    - Future: Admin can "pin" specific feedback to homepage
 *
 * RESPONSIVE BEHAVIOR:
 * ===================
 * - Desktop: 3 cards in a row (equal height)
 * - Tablet: 2 cards per row (1 card on second row)
 * - Mobile: 1 card per row (stacked)
 *
 * STANDARDIZED SIZING:
 * ====================
 * - Min height: 280px (ensures consistent card height)
 * - Max height: 400px (prevents very long feedback from breaking layout)
 * - Message clamp: 4 lines (WebkitLineClamp)
 * - Overflow: Ellipsis with "..." indicator
 *
 * FILTERING LOGIC:
 * ================
 * - Type: feedback OR enquiry (both show positive experiences)
 * - Status: "resolved" means admin has reviewed/acknowledged
 *
 *   NOTE: For feedback, "resolved" doesn't mean "issue fixed" but rather:
 *   - Admin has reviewed the feedback
 *   - Feedback is acknowledged
 *   - Ready for potential public display
 *
 *   For enquiry, "resolved" means:
 *   - Question has been answered
 *   - User's issue is resolved
 *
 * - Rating: For feedback type, only show 4-5 stars (positive experiences)
 *
 * DESIGN RATIONALE:
 * =================
 * Q: Should feedback have "resolved" status?
 * A: Technically, feedback is not an "issue" to resolve. However:
 *    - We use "resolved" to mean "reviewed and acknowledged by admin"
 *    - Indicates admin has seen and processed the feedback
 *    - Prevents showing brand new, unreviewed feedback publicly
 *
 * FUTURE ENHANCEMENT:
 * ===================
 * Consider separate status models:
 * - Bug/Enquiry: pending → in-progress → resolved → closed
 * - Feedback: submitted → reviewed → acknowledged → archived
 * - Add: isReviewed (Boolean), isPublic (Boolean)
 *
 * TODO: Backend Enhancements
 * ==========================
 * 1. Create public API endpoint: GET /api/contact/public/testimonials
 * 2. Add fields to Contact model:
 *    - isPublic: Boolean (default: false, admin approves)
 *    - isReviewed: Boolean (admin has seen it)
 *    - displayName: String (optional custom name for privacy)
 *    - isApprovedForDisplay: Boolean (admin approval)
 *    - isPinned: Boolean (admin can pin to homepage)
 * 3. Admin approval workflow in ContactManagementPage
 * 4. Privacy options: Allow users to opt-in during submission
 * 5. Create dedicated "/reviews" or "/testimonials" page with full list + pagination
 */

function CustomerFeedbackSection() {
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with public endpoint once backend is ready
        // For now, using admin endpoint (will need to create public one)
        const response = await api.get("/contact", {
          params: {
            type: "feedback,enquiry", // Accept both feedback and enquiry
            status: "resolved", // Only show resolved submissions
            limit: 3, // LIMIT: Show only 3 feedback cards (professional standard)
            sort: "-createdAt", // Most recent first
          },
        });

        if (response.data.success && response.data.contacts) {
          // Filter to only show positive feedback (rating >= 4 if exists)
          const positiveFeedback = response.data.contacts.filter((contact) => {
            // If feedback with rating, only show 4-5 stars
            if (
              contact.type === "feedback" &&
              contact.feedbackDetails?.rating
            ) {
              return contact.feedbackDetails.rating >= 4;
            }
            // For enquiries or feedback without rating, show all resolved ones
            return true;
          });

          // Ensure we only display maximum 3 cards
          setFeedbacks(positiveFeedback.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching customer feedback:", err);
        // If endpoint doesn't exist yet or user not authorized, silently hide section
        if (err.response?.status === 404 || err.response?.status === 403) {
          setFeedbacks([]);
        } else {
          setError("Unable to load customer feedback");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Don't show section if no feedback or still loading with error
  if (!loading && feedbacks.length === 0 && !error) {
    return null;
  }

  // Show error only if it's not a "not found" error
  if (error) {
    return null; // Silently hide for now until backend endpoint is ready
  }

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const getAvatarProps = (feedback) => {
    // If authenticated user with avatar
    if (feedback.submittedBy?.userId?.profile?.avatar) {
      return {
        src: feedback.submittedBy.userId.profile.avatar,
        alt: feedback.submittedBy.name,
      };
    }
    // Fallback to initials
    return {
      children: getInitials(feedback.submittedBy.name),
      sx: {
        bgcolor: theme.palette.primary.main,
      },
    };
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Recently";
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        bgcolor: "background.default", // Changed from background.paper to match other sections
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Section Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <RateReview
              sx={{ color: theme.palette.secondary.main, fontSize: 32 }}
            />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
                letterSpacing: "-0.01em",
              }}
            >
              What Our Users Say
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
            }}
          >
            Real experiences from our community members
          </Typography>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Card
                  sx={{
                    height: 320, // Standardized height for skeleton
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Skeleton variant="circular" width={48} height={48} />
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="80%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {/* Feedback Grid - 3 cards max */}
            <Grid container spacing={3}>
              {feedbacks.map((feedback) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feedback._id}>
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 280, // Minimum height for consistency
                      maxHeight: 400, // Maximum height to prevent overflow
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    {/* Quote Icon */}
                    <FormatQuote
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontSize: 40,
                        color: theme.palette.primary.light,
                        opacity: 0.2,
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* User Info */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          {...getAvatarProps(feedback)}
                          sx={{
                            width: 48,
                            height: 48,
                            ...getAvatarProps(feedback).sx,
                          }}
                        />
                        <Box sx={{ ml: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "medium" }}
                          >
                            {feedback.submittedBy.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(feedback.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Rating (if feedback type with rating) */}
                      {feedback.type === "feedback" &&
                        feedback.feedbackDetails?.rating && (
                          <Box sx={{ mb: 1.5 }}>
                            <Rating
                              value={feedback.feedbackDetails.rating}
                              readOnly
                              size="small"
                            />
                          </Box>
                        )}

                      {/* Subject */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {feedback.subject}
                      </Typography>

                      {/* Message */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 4, // Limit to 4 lines
                          WebkitBoxOrient: "vertical",
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          minHeight: "6.4em", // 4 lines * 1.6 line-height = consistent height
                        }}
                      >
                        "{feedback.message}"
                      </Typography>

                      {/* Type Badge */}
                      <Box sx={{ mt: "auto", pt: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            bgcolor:
                              feedback.type === "feedback"
                                ? theme.palette.success.light
                                : theme.palette.info.light,
                            color:
                              feedback.type === "feedback"
                                ? theme.palette.success.dark
                                : theme.palette.info.dark,
                            borderRadius: 1,
                            fontWeight: "medium",
                            fontSize: "0.7rem",
                          }}
                        >
                          {feedback.type === "feedback"
                            ? "Customer Feedback"
                            : "Happy Customer"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Call to Action */}
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                }}
              >
                Have feedback to share? We'd love to hear from you!
              </Typography>
              <Button
                component={Link}
                to={ROUTES.CONTACT}
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                }}
              >
                Share Your Experience
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

export default CustomerFeedbackSection;
