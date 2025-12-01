import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Build } from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import useListings from "../../features/listing/hooks/useListings";
import ListingGrid from "../../features/listing/components/ListingGrid";
import ListingFilters from "../../features/listing/components/ListingFilters";
import { ErrorAlert } from "../../components/common/Alert";

const ServicesPage = () => {
  const { theme } = useTheme();
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
  } = useListings({ autoFetch: true, type: "service" });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
              boxShadow: 3,
            }}
          >
            <Build
              sx={{
                fontSize: 32,
                color: "white",
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5,
              }}
            >
              Services
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
              >
                {pagination.totalListings || 0}{" "}
                {pagination.totalListings === 1 ? "service" : "services"}{" "}
                available
              </Typography>
              {listings.filter((l) => l.isFree).length > 0 && (
                <>
                  <Typography variant="body1" color="text.secondary">
                    •
                  </Typography>
                  <Chip
                    label={`${listings.filter((l) => l.isFree).length} Free ${listings.filter((l) => l.isFree).length === 1 ? "service" : "services"}`}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters*/}
      <ListingFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        type="service"
      />

      {/* Error Alert */}
      <ErrorAlert
        error={error}
        show={!!error}
        fallback="Failed to load services. Please try again."
      />

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading services...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <ListingGrid
          listings={listings}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          emptyMessage="No services found. Try adjusting your filters."
        />
      )}
    </Container>
  );
};

export default ServicesPage;
