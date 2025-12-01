import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import useListings from "../../features/listing/hooks/useListings";
import BrowseLayout from "../../features/listing/components/BrowseLayout";

/**
 * BrowsePage - Container component for browsing listings
 * Handles business logic, data fetching, and URL synchronization
 * Delegates presentation to BrowseLayout component
 *
 * CRITICAL: URL is the SINGLE SOURCE OF TRUTH for type and category
 * All updates flow: User Action → URL → Redux → API
 */
const BrowsePage = () => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get type and category from URL - SINGLE SOURCE OF TRUTH
  const urlType = searchParams.get("type");
  const urlCategory = searchParams.get("category");
  const [activeType, setActiveType] = useState(urlType || "all");
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent multiple simultaneous updates
  const isUpdating = useRef(false);

  // Fetch listings - only autoFetch AFTER we've synced URL to Redux
  const {
    listings,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    handlePageChange,
    handleLimitChange,
  } = useListings({
    autoFetch: isInitialized,
  });

  // SINGLE EFFECT: Sync URL → Redux filters (one-way flow)
  // This is the ONLY place where we update Redux filters from URL
  useEffect(() => {
    if (isUpdating.current) {
      return;
    }

    // Sync local activeType state with URL
    const newActiveType = urlType || "all";
    if (newActiveType !== activeType) {
      setActiveType(newActiveType);
    }

    // Build filter updates from URL
    const updates = {};
    let hasChanges = false;

    // Sync type
    const expectedType = urlType || null;
    if (expectedType !== filters.type) {
      updates.type = expectedType;
      hasChanges = true;
    }

    // Sync category
    if (urlCategory !== filters.category) {
      updates.category = urlCategory || null;
      hasChanges = true;

      // CRITICAL: Clear search when category changes from URL
      // This ensures homepage category clicks show all items in that category
      if (filters.search) {
        updates.search = "";
      }
    }

    // Apply updates in one batch
    if (hasChanges) {
      isUpdating.current = true;
      updateFilters(updates);
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    }

    // Mark as initialized after first sync so useListings can start fetching
    if (!isInitialized) {
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlType, urlCategory]); // Only URL changes trigger this

  // Handle type toggle - directly update URL (skip local state manipulation)
  const handleTypeChange = (event, newType) => {
    if (newType !== null && !isUpdating.current) {
      isUpdating.current = true;

      const currentParams = Object.fromEntries(searchParams.entries());

      if (newType === "all") {
        // Remove type and category when switching to "all"
        const { type, category, ...rest } = currentParams;
        setSearchParams(rest, { replace: true });
      } else {
        // Set new type and remove category (will be cleared by filter handler)
        const { category, ...rest } = currentParams;
        setSearchParams({ ...rest, type: newType }, { replace: true });
      }

      // Clear category and search in Redux
      updateFilters({ category: null, search: "" });

      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    }
  };

  // Handle category changes from ListingFilters → Update URL
  const handleFilterChange = (newFilters) => {
    if (isUpdating.current) {
      return;
    }

    isUpdating.current = true;

    // Update Redux first
    updateFilters(newFilters);

    // Then sync category to URL if it changed
    if (newFilters.category !== undefined) {
      const currentParams = Object.fromEntries(searchParams.entries());
      if (newFilters.category) {
        setSearchParams(
          { ...currentParams, category: newFilters.category },
          { replace: true }
        );
      } else if (currentParams.category) {
        const { category, ...rest } = currentParams;
        setSearchParams(rest, { replace: true });
      }
    }

    requestAnimationFrame(() => {
      isUpdating.current = false;
    });
  };

  // Handle reset - clear everything
  const handleReset = () => {
    if (!isUpdating.current) {
      isUpdating.current = true;
      resetFilters();
      setSearchParams({}, { replace: true });
      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    }
  };

  const getGradient = () => {
    const gradientMap = {
      product: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      service: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
      all: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    };
    return gradientMap[activeType] || gradientMap.all;
  };

  return (
    <BrowseLayout
      activeType={activeType}
      onTypeChange={handleTypeChange}
      listings={listings}
      pagination={pagination}
      filters={filters}
      isLoading={isLoading}
      error={error}
      onFilterChange={handleFilterChange}
      onFilterReset={handleReset}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
      getGradient={getGradient}
    />
  );
};

export default BrowsePage;
