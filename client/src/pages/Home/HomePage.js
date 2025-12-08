import React, { useState, useEffect, useMemo } from "react";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";
import listingService from "../../features/listing/service/listingService";

// Home components
import HeroSection from "../../components/home/HeroSection";
import QuickActions from "../../components/home/QuickActions";
import CategoriesGrid from "../../components/home/CategoriesGrid";
import ListingTypeToggle from "../../components/home/ListingTypeToggle";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import TrendingItems from "../../components/home/TrendingItems";
import MerchantSpotlight from "../../components/home/MerchantSpotlight";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import TestimonialsCarousel from "../../components/home/TestimonialsCarousel";
import TrustIndicators from "../../components/home/TrustIndicators";
import CTASection from "../../components/home/CTASection";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [listingType, setListingType] = useState(
    searchParams.get("type") || "all"
  );
  const [featuredListings, setFeaturedListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});

  // Fetch featured listings based on type
  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          limit: 4,
          sort: "-createdAt",
        };

        // Add type filter if not "all"
        if (listingType !== "all") {
          params.type = listingType;
        }

        const response = await listingService.getAllListings(params);
        // Handle response structure: response.data can be array or object with listings property
        const listings = Array.isArray(response.data)
          ? response.data
          : response.data.listings || response.data.data || [];

        setFeaturedListings(listings);
      } catch (err) {
        console.error("Error fetching featured listings:", err);
        setError("Failed to load featured items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, [listingType]);

  // Fetch trending listings (separate from featured)
  useEffect(() => {
    const fetchTrendingListings = async () => {
      try {
        const params = {
          limit: 6,
          sort: "-createdAt", // Use createdAt since viewCount might not exist yet
        };

        const response = await listingService.getAllListings(params);
        const listings = Array.isArray(response.data)
          ? response.data
          : response.data.listings || response.data.data || [];

        setTrendingListings(listings);
      } catch (err) {
        console.error("Error fetching trending listings:", err);
      }
    };

    fetchTrendingListings();
  }, []);

  // Fetch category statistics
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await listingService.getAllListings({
          limit: 100, // Max allowed by API validation
        });
        const listings = Array.isArray(response.data)
          ? response.data
          : response.data.listings || response.data.data || [];

        // Filter only available listings and count by category AND type
        const stats = listings
          .filter((listing) => listing.isAvailable === true)
          .reduce((acc, listing) => {
            const category = listing.category || "other";
            const type = listing.type || "product";

            // Count for specific category
            acc[category] = (acc[category] || 0) + 1;

            // Count for type totals
            acc[`${type}_total`] = (acc[`${type}_total`] || 0) + 1;

            return acc;
          }, {});

        setCategoryStats(stats);
      } catch (err) {
        console.error("Error fetching category stats:", err);
      }
    };

    fetchCategoryStats();
  }, []);

  // Handle listing type change
  const handleListingTypeChange = (newType) => {
    setListingType(newType);

    // Update URL params
    if (newType === "all") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", newType);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Memoized filtered listings
  const displayedListings = useMemo(() => {
    return featuredListings;
  }, [featuredListings]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section with Image Carousel */}
      <HeroSection />

      {/* Role-based Quick Actions */}
      <QuickActions />

      {/* Error Display */}
      {error && (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Listing Type Toggle */}
      <ListingTypeToggle
        value={listingType}
        onChange={handleListingTypeChange}
        stats={categoryStats}
      />

      {/* Categories Grid with Real Counts */}
      <CategoriesGrid listingType={listingType} categoryStats={categoryStats} />

      {/* Featured Products Section with Real Data */}
      {loading ? (
        <Container maxWidth="lg" sx={{ mb: 6, textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Container>
      ) : (
        <FeaturedProducts
          listings={displayedListings}
          listingType={listingType}
        />
      )}

      {/* Trending Items Section */}
      {loading ? (
        <Container maxWidth="lg" sx={{ mb: 6, textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Container>
      ) : (
        <TrendingItems listings={trendingListings} />
      )}

      {/* Recently Viewed (Authenticated Users Only) */}
      {isAuthenticated && <RecentlyViewed />}

      {/* Merchant Spotlight Section */}
      <MerchantSpotlight />

      {/* Customer Testimonials */}
      <TestimonialsCarousel />

      {/* Trust and Security Indicators */}
      <TrustIndicators />

      {/* Call to Action Section */}
      <CTASection />
    </Box>
  );
}

export default HomePage;
