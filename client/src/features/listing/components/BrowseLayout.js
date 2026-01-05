import {
  Box,
  Container,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import BrowseHeader from "./BrowseHeader";
import ListingFilters from "./ListingFilters";
import ListingGrid from "./ListingGrid";
import ErrorAlert from "../../../components/common/Alert/ErrorAlert";
import { useTheme } from "../../../hooks/useTheme";

/**
 * BrowseLayout - Reusable layout template for browsing listings
 * This component handles the presentation layer, keeping it separate from business logic
 *
 * @param {Object} props
 * @param {string} props.activeType - Current active type ('all', 'product', 'service')
 * @param {Function} props.onTypeChange - Callback when type toggle changes
 * @param {Array} props.listings - Array of listing items
 * @param {Object} props.pagination - Pagination data
 * @param {Object} props.filters - Current filter values
 * @param {boolean} props.isLoading - Loading state
 * @param {Error} props.error - Error object if any
 * @param {Function} props.onFilterChange - Callback for filter changes
 * @param {Function} props.onFilterReset - Callback to reset filters
 * @param {Function} props.onPageChange - Callback for page changes
 * @param {Function} props.onLimitChange - Callback for limit changes
 * @param {Function} props.getGradient - Function to get gradient based on type
 * @param {Object} props.typeConfig - Optional configuration for custom types
 */
const BrowseLayout = ({
  activeType,
  onTypeChange,
  listings = [],
  pagination = {},
  filters = {},
  isLoading = false,
  error = null,
  onFilterChange,
  onFilterReset,
  onPageChange,
  onLimitChange,
  getGradient,
  typeConfig,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate free items count
  const freeCount = listings.filter((listing) => listing.isFree).length;

  return (
    <Container disableGutters sx={{ p: isMobile ? 2 : 4 }}>
      {/* Page Header Section */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        {/* Dynamic Header */}
        <BrowseHeader
          activeType={activeType}
          totalCount={pagination.totalListings || 0}
          freeCount={freeCount}
          getGradient={getGradient}
        />
      </Box>

      {/* Integrated Filters Section with Type Toggle */}
      <ListingFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onFilterReset}
        type={filters.type}
        activeType={activeType}
        onTypeChange={onTypeChange}
      />

      {/* Error Alert */}
      <ErrorAlert
        error={error}
        show={!!error}
        fallback="Failed to load listings. Please try again."
      />

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading {activeType === "all" ? "listings" : `${activeType}s`}...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <ListingGrid
          listings={listings}
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          emptyMessage={`No ${
            activeType === "all" ? "listings" : `${activeType}s`
          } found. Try adjusting your filters.`}
        />
      )}
    </Container>
  );
};

export default BrowseLayout;
