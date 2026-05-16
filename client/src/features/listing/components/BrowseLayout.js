import {
  Box,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import BrowseHeader from "./BrowseHeader";
import ListingFilters from "./ListingFilters";
import ListingGrid from "./ListingGrid";
import ErrorAlert from "../../../components/common/Alert/ErrorAlert";
import { useTheme } from "../../../hooks/useTheme";
import {
  CATEGORY_LABELS,
  SORT_OPTIONS,
} from "../../../constants/listingConstant";

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
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const freeCount = listings.filter((listing) => listing.isFree).length;
  const sortOption = SORT_OPTIONS.find(
    (option) => option.value === (filters.sort || "-createdAt"),
  );
  const browseLabel =
    activeType === "product"
      ? "products"
      : activeType === "service"
        ? "services"
        : "listings";
  const hasSummaryFilters = Boolean(
    filters.search ||
      filters.category ||
      (filters.sort && filters.sort !== "-createdAt"),
  );
  const resultAnnouncement = filters.search
    ? `${pagination.totalListings || 0} ${browseLabel} found for search ${filters.search}.`
    : `${pagination.totalListings || 0} ${browseLabel} found.`;

  const handleClearSearch = () => onFilterChange?.({ search: "" });
  const handleClearCategory = () => onFilterChange?.({ category: null });
  const handleClearSort = () => onFilterChange?.({ sort: "-createdAt" });

  return (
    <Container disableGutters sx={{ p: isMobile ? 2 : 4 }}>
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <BrowseHeader
          activeType={activeType}
          totalCount={pagination.totalListings || 0}
          freeCount={freeCount}
          getGradient={getGradient}
        />
      </Box>

      <ListingFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onFilterReset}
        type={filters.type}
        activeType={activeType}
        onTypeChange={onTypeChange}
      />

      <ErrorAlert
        error={error}
        show={!!error}
        fallback="Failed to load listings. Please try again."
      />

      <Box
        sx={{
          position: "relative",
          mb: 2,
          p: isMobile ? 1.25 : 1.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {resultAnnouncement}
        </Box>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          justifyContent="space-between"
          alignItems={isMobile ? "flex-start" : "center"}
        >
          <Box>
            <Typography
              variant={isMobile ? "body1" : "subtitle1"}
              fontWeight={700}
            >
              {pagination.totalListings || 0} {browseLabel} found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filters.search
                ? `Live results for "${filters.search}"`
                : `Browsing ${browseLabel}${activeType === "all" ? "" : " only"}`}
            </Typography>
          </Box>

          {hasSummaryFilters && (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  onDelete={handleClearSearch}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.category && (
                <Chip
                  label={CATEGORY_LABELS[filters.category] || filters.category}
                  onDelete={handleClearCategory}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {filters.sort && filters.sort !== "-createdAt" && (
                <Chip
                  label={sortOption?.label || "Custom sort"}
                  onDelete={handleClearSort}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      <ListingGrid
        listings={listings}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyMessage={`No ${
          activeType === "all" ? "listings" : `${activeType}s`
        } found. Try adjusting your filters.`}
      />
    </Container>
  );
};

export default BrowseLayout;
