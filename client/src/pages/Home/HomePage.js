import React, { useState, useMemo } from "react";
import { Box, Container, Alert } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useGetListingsQuery } from "../../features/listing/api/listingApi";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";

// Home components
import HeroSection from "../../components/home/HeroSection";
import QuickActions from "../../components/home/QuickActions";
import BrowseSection from "../../components/home/BrowseSection";
import LatestItems from "../../components/home/LatestItems";
import MerchantSpotlight from "../../components/home/MerchantSpotlight";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import CustomerFeedbackSection from "../../components/home/CustomerFeedbackSection";
import TrustIndicators from "../../components/home/TrustIndicators";
import CTASection from "../../components/home/CTASection";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [listingType, setListingType] = useState(
    searchParams.get("type") || "all"
  );

  // RTK Query - Automatic caching and deduplication!
  // Latest listings (unified - replaces featured & trending)
  const {
    data: latestListings = [],
    isLoading: latestLoading,
    error: latestError,
  } = useGetListingsQuery({
    limit: 8,
    sort: "-createdAt",
    ...(listingType !== "all" && { type: listingType }),
  });

  // Category stats (cached for 60s)
  const { data: allListings = [], isLoading: statsLoading } =
    useGetListingsQuery({
      limit: 100,
    });

  // Calculate category stats from cached data
  const categoryStats = useMemo(() => {
    return allListings
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
  }, [allListings]);

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

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section with Image Carousel */}
      <HeroSection />

      {/* Role-based Quick Actions */}
      <QuickActions />

      {/* Error Display */}
      {latestError && (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Alert severity="error">
            Failed to load latest items. Please try again later.
          </Alert>
        </Container>
      )}

      {/* Browse Section - Unified Listing Type + Categories */}
      <BrowseSection
        value={listingType}
        onChange={handleListingTypeChange}
        categoryStats={categoryStats}
      />

      {/* Latest Items Section (Replaces Featured & Trending) */}
      {latestLoading ? (
        <Container maxWidth="lg" sx={{ mb: 6, px: { xs: 2, sm: 3 }, py: 4 }}>
          <DynamicSkeleton
            type="page"
            config={{
              contentType: "grid",
              items: 8,
              showHeader: false,
              showFooter: false,
            }}
          />
        </Container>
      ) : (
        <LatestItems listings={latestListings} listingType={listingType} />
      )}

      {/* Recently Viewed (Authenticated Users Only) */}
      {isAuthenticated && <RecentlyViewed />}

      {/* Merchant Spotlight Section */}
      <MerchantSpotlight />

      {/* Customer Feedback Section - Real Data from Contact System */}
      <CustomerFeedbackSection />

      {/* Trust and Security Indicators */}
      <TrustIndicators />

      {/* TODO: Real Testimonials Section - Future Enhancement
       * IMPLEMENTATION PLAN:
       * 1. Create new component: <RealTestimonialsSection />
       * 2. Fetch approved feedback from Contact system via API
       * 3. API Endpoint: GET /api/contact/public/testimonials
       * 4. Criteria: type='feedback', status='resolved', rating >= 4, isPublic=true
       * 5. Display format: User name, rating stars, feedback message, date
       * 6. Features:
       *    - Real user feedback from contact form submissions
       *    - Admin-approved testimonials only (prevents fake/spam)
       *    - Optional: Allow users to opt-in for public display during submission
       *    - Privacy: Show only first name or username (configurable)
       *    - Carousel/Grid display with 3-6 testimonials
       * 7. Fallback: If no testimonials, show "Be the first to share feedback"
       * 8. Link to /contact page for users to submit their own feedback
       *
       * BACKEND REQUIREMENTS (to implement later):
       * - Add 'isPublic' boolean field to Contact model (default: false)
       * - Add 'displayName' field for customized public name
       * - Add admin approval workflow in ContactManagementPage
       * - Create public endpoint (no auth required)
       * - Index: { type: 1, status: 1, isPublic: 1, rating: -1 }
       *
       * WHY REMOVED: Previous TestimonialsCarousel used fake placeholder data
       * (hardcoded names, fake avatars from pravatar.cc, mock reviews)
       * which is unprofessional for enterprise-level platform.
       *
       * UPDATE: CustomerFeedbackSection now implemented above - replace this comment
       * once public API endpoint is ready and admin approval workflow is in place.
       */}

      {/* Call to Action Section */}
      <CTASection />
    </Box>
  );
}

export default HomePage;
