import React from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import ListingCard from "../../features/listing/components/ListingCard";

function TrendingItems({ listings = [] }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6, width: "100%", overflow: "hidden" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUp
            sx={{
              color: theme.palette.warning.main,
              fontSize: { xs: 28, sm: 32 },
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Trending Now
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Most popular items this week
            </Typography>
          </Box>
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
    </Box>
  );
}

export default TrendingItems;
