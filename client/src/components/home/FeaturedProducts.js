import React from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import ListingCard from "../../features/listing/components/ListingCard";

function FeaturedProducts({
  listings = [],
  listingType = "all",
  loading = false,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Box sx={{ display: "flex", gap: 3, overflowX: "auto" }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flexShrink: 0, width: 280 }}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  // Empty state
  if (!listings || listings.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mb: 6, textAlign: "center", py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No listings available at the moment.
        </Typography>
        <Button
          component={Link}
          to={ROUTES.LISTINGS.ALL}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Browse All Listings
        </Button>
      </Container>
    );
  }

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Featured{" "}
              {listingType === "all"
                ? "Items"
                : listingType === "product"
                  ? "Products"
                  : "Services"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
              }}
            >
              Handpicked {listingType === "all" ? "items" : listingType + "s"}{" "}
              just for you
            </Typography>
          </Box>

          <Button
            component={Link}
            to={`${ROUTES.LISTINGS.ALL}${listingType !== "all" ? `?type=${listingType}` : ""}`}
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            View All
          </Button>
        </Box>
      </Container>

      {/* Horizontal Scrollable Grid */}
      {isMobile ? (
        // Mobile: Full-width scroll
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
            {listings.slice(0, 10).map((listing) => (
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
        // Desktop: Contained scroll
        <Container maxWidth="lg" sx={{ px: 3 }}>
          <Box
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              pb: 2,
              mx: -3,
              px: 3,
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
                gap: 2,
              }}
            >
              {listings.slice(0, 10).map((listing) => (
                <Box
                  key={listing._id}
                  sx={{
                    flexShrink: 0,
                    width: 240,
                    scrollSnapAlign: "start",
                  }}
                >
                  <ListingCard listing={listing} />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Mobile View All Button */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            textAlign: "center",
            mt: 3,
          }}
        >
          <Button
            component={Link}
            to={`${ROUTES.LISTINGS.ALL}${listingType !== "all" ? `?type=${listingType}` : ""}`}
            variant="outlined"
            fullWidth
          >
            View All{" "}
            {listingType === "all"
              ? "Items"
              : listingType === "product"
                ? "Products"
                : "Services"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default FeaturedProducts;
