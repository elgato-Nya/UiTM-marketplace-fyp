import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import ListingCard from "../../features/listing/components/ListingCard";

/**
 * LatestItems Component
 *
 * PURPOSE: Display recently added listings (replaces FeaturedProducts & TrendingItems)
 * SHOWS: Latest 8 listings sorted by creation date (2 rows x 4 items)
 * LAYOUT: Matches FeaturedProducts styling - horizontal scroll on mobile, grid on desktop
 *
 * TODO: Future Enhancements
 * ========================
 * 1. FEATURED ITEMS (Admin-Promoted):
 *    - Add 'isFeatured' boolean field to Listing model
 *    - Admin can mark listings as featured from admin panel
 *    - Query: { isFeatured: true, isAvailable: true }
 *    - Display with special badge/styling
 *    - Separate carousel/section above Latest Items
 *
 * 2. TRENDING ITEMS (Algorithm-Based):
 *    - Track engagement metrics: views, favorites, cart adds, purchases
 *    - Calculate trending score: (views * 1 + favorites * 3 + purchases * 10)
 *    - Time decay factor (recent activity weighted higher)
 *    - Add 'trendingScore' virtual field or separate collection
 *    - Query: sort by trendingScore, last 7 days
 *    - Show trending indicator (🔥 icon, "Hot" badge)
 *
 * 3. IMPLEMENTATION:
 *    - Create TrendingAnalytics model to track metrics
 *    - Add daily cron job to calculate trending scores
 *    - Create admin UI to manage featured listings
 *    - Add A/B testing for featured placement effectiveness
 */

function LatestItems({ listings = [], listingType = "all" }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!listings || listings.length === 0) {
    return null;
  }

  const getTypeLabel = () => {
    if (listingType === "product") return "Products";
    if (listingType === "service") return "Services";
    return "Items";
  };

  // Limit to 8 items (2 rows of 4 on desktop)
  const displayedListings = listings.slice(0, 8);

  return (
    <Box
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        bgcolor: "background.default",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <TrendingUp
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: { xs: 24, sm: 28, md: 32 },
                }}
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
                Latest {getTypeLabel()}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
              }}
            >
              Discover the newest additions to our marketplace
            </Typography>
          </Box>

          <Button
            component={Link}
            to={
              listingType === "all"
                ? ROUTES.LISTINGS.ALL
                : `${ROUTES.LISTINGS.ALL}?type=${listingType}`
            }
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            View All
          </Button>
        </Box>
      </Container>

      {/* Horizontal Scrollable Grid (Mobile) / Fixed Grid (Desktop) */}
      {isMobile ? (
        // Mobile: Full-width horizontal scroll
        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            overflowX: "auto",
            overflowY: "hidden",
            pb: 2,
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "background.paper",
              borderRadius: 1,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: theme.palette.primary.main,
              borderRadius: 1,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              px: { xs: 2, sm: 3 },
            }}
          >
            {displayedListings.map((listing) => (
              <Box
                key={listing._id}
                sx={{
                  flexShrink: 0,
                  width: { xs: 180, sm: 220 },
                  scrollSnapAlign: "start",
                }}
              >
                <ListingCard listing={listing} />
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        // Desktop: Fixed grid layout (4 columns, 2 rows)
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {displayedListings.map((listing) => (
              <Box key={listing._id}>
                <ListingCard listing={listing} />
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Browse More Button (Mobile Only) */}
      {isMobile && (
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: 3 }}>
          <Button
            component={Link}
            to={
              listingType === "all"
                ? ROUTES.LISTINGS.ALL
                : `${ROUTES.LISTINGS.ALL}?type=${listingType}`
            }
            variant="outlined"
            fullWidth
          >
            View All {getTypeLabel()}
          </Button>
        </Container>
      )}
    </Box>
  );
}

export default LatestItems;
