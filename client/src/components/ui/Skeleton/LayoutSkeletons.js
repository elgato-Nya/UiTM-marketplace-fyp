import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * Layout-level skeleton components for header, sidebar, and footer
 */

/**
 * Header skeleton component
 * @param {Object} config - Configuration object with dimensions
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const HeaderSkeleton = ({ config, skeletonProps }) => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        height: config.dimensions.headerHeight,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Skeleton variant="circular" width={40} height={40} {...skeletonProps} />
      <Skeleton variant="text" width="20%" height={24} {...skeletonProps} />
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton
        variant="rectangular"
        width={100}
        height={32}
        sx={{ borderRadius: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      <Skeleton
        variant="rectangular"
        width={80}
        height={32}
        sx={{ borderRadius: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      <Skeleton variant="circular" width={32} height={32} {...skeletonProps} />
    </Box>
  );
};

/**
 * Sidebar skeleton component
 * @param {Object} config - Configuration object with dimensions
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const SidebarSkeleton = ({ config, skeletonProps }) => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        width: config.dimensions.sidebarWidth,
        minHeight: "100vh",
        p: 2,
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Skeleton
        variant="text"
        width="70%"
        height={28}
        sx={{ mb: 3, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
        >
          <Skeleton
            variant="rectangular"
            width={20}
            height={20}
            sx={{ borderRadius: 0.5, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton variant="text" width="60%" height={20} {...skeletonProps} />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Footer skeleton component
 * @param {Object} config - Configuration object with dimensions
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const FooterSkeleton = ({ config, skeletonProps }) => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        height: config.dimensions.footerHeight,
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Skeleton variant="text" width="200px" height={16} {...skeletonProps} />
    </Box>
  );
};
