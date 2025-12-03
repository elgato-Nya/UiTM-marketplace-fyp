import React from "react";
import { Box, Skeleton, Container, Grid } from "@mui/material";

/**
 * SkeletonLoader - Dynamic skeleton component that adapts to different page types
 *
 * @param {Object} config - Configuration object for skeleton layout
 * @param {string} config.type - Type of skeleton ('form', 'dashboard', 'profile', 'grid', 'home')
 * @param {boolean} config.centered - Whether to center the content
 * @param {Array} config.elements - Array of skeleton elements for form type
 * @param {string} config.layout - Layout type for dashboard ('admin', 'merchant')
 * @param {boolean} config.showSidebar - Show sidebar skeleton
 * @param {boolean} config.showHeader - Show header skeleton
 * @param {boolean} config.showAvatar - Show avatar skeleton
 * @param {boolean} config.showTabs - Show tabs skeleton
 * @param {number} config.columns - Number of columns for grid
 * @param {number} config.rows - Number of rows for grid
 * @param {boolean} config.showFilters - Show filters skeleton
 * @param {boolean} config.showHero - Show hero section skeleton
 * @param {boolean} config.showCategories - Show categories skeleton
 * @param {boolean} config.showFeatured - Show featured section skeleton
 */
function SkeletonLoader({ config }) {
  const renderFormSkeleton = () => (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent={config.centered ? "center" : "flex-start"}
        minHeight={config.centered ? "100vh" : "auto"}
        gap={3}
        py={4}
      >
        <Skeleton variant="text" width={200} height={40} />
        {config.elements?.map((element, index) => (
          <Skeleton
            key={index}
            variant={element.type === "button" ? "rectangular" : "text"}
            width={element.width}
            height={element.height}
            sx={{ borderRadius: element.type === "button" ? 1 : 0 }}
          />
        ))}
      </Box>
    </Container>
  );

  const renderDashboardSkeleton = () => (
    <Box display="flex" minHeight="100vh">
      {config.showSidebar && (
        <Box width={280} bgcolor="background.paper" p={2}>
          <Skeleton variant="text" width={120} height={30} sx={{ mb: 3 }} />
          {[...Array(8)].map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width="100%"
              height={40}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )}
      <Box flex={1}>
        {config.showHeader && (
          <Box p={2} borderBottom={1} borderColor="divider">
            <Skeleton variant="text" width={300} height={32} />
          </Box>
        )}
        <Box p={3}>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="100%" height={60} />
                  <Skeleton variant="rectangular" width="100%" height={100} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );

  const renderProfileSkeleton = () => (
    <Container maxWidth="md">
      <Box py={4}>
        {config.showAvatar && (
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Skeleton variant="circular" width={120} height={120} />
            <Box>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={150} height={24} />
            </Box>
          </Box>
        )}
        {config.showTabs && (
          <Box mb={3}>
            <Box display="flex" gap={2} borderBottom={1} borderColor="divider">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} variant="text" width={100} height={40} />
              ))}
            </Box>
          </Box>
        )}
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Skeleton variant="text" width="100%" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );

  const renderGridSkeleton = () => (
    <Container maxWidth="lg">
      <Box py={4}>
        {config.showFilters && (
          <Box mb={3} p={2} border={1} borderColor="divider" borderRadius={1}>
            <Box display="flex" gap={2} flexWrap="wrap">
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  width={120}
                  height={40}
                />
              ))}
            </Box>
          </Box>
        )}
        <Grid container spacing={3}>
          {[...Array(config.columns * config.rows)].map((_, index) => (
            <Grid size={{ xs: 12, md: 12 / config.columns }} key={index}>
              <Box
                border={1}
                borderColor="divider"
                borderRadius={1}
                overflow="hidden"
              >
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Box p={2}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );

  const renderHomeSkeleton = () => (
    <Box>
      {config.showHero && (
        <Box
          height={400}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.100"
        >
          <Box textAlign="center">
            <Skeleton variant="text" width={400} height={60} />
            <Skeleton variant="text" width={300} height={30} />
            <Box mt={2}>
              <Skeleton variant="rectangular" width={150} height={40} />
            </Box>
          </Box>
        </Box>
      )}

      <Container maxWidth="lg">
        {config.showCategories && (
          <Box py={6}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid size={{ xs: 6, md: 4, lg: 2 }} key={index}>
                  <Box textAlign="center">
                    <Skeleton
                      variant="circular"
                      width={80}
                      height={80}
                      sx={{ mx: "auto", mb: 1 }}
                    />
                    <Skeleton variant="text" width="100%" height={20} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {config.showFeatured && (
          <Box py={6}>
            <Skeleton variant="text" width={250} height={40} sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {[...Array(8)].map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <Box
                    border={1}
                    borderColor="divider"
                    borderRadius={1}
                    overflow="hidden"
                  >
                    <Skeleton variant="rectangular" width="100%" height={180} />
                    <Box p={2}>
                      <Skeleton variant="text" width="100%" height={24} />
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );

  // Render based on skeleton type
  switch (config.type) {
    case "form":
      return renderFormSkeleton();
    case "dashboard":
      return renderDashboardSkeleton();
    case "profile":
      return renderProfileSkeleton();
    case "grid":
      return renderGridSkeleton();
    case "home":
      return renderHomeSkeleton();
    default:
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Skeleton variant="rectangular" width={300} height={200} />
        </Box>
      );
  }
}

export default SkeletonLoader;
