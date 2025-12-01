import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";
import {
  FormSkeleton,
  ListSkeleton,
  GridSkeleton,
  CartSkeleton,
  WishlistSkeleton,
  CheckoutSkeleton,
} from "./ContentSkeletons";
import {
  HeaderSkeleton,
  SidebarSkeleton,
  FooterSkeleton,
} from "./LayoutSkeletons";
import {
  DashboardSkeleton,
  HomeSkeleton,
  DefaultPageSkeleton,
  ProfileSkeleton,
} from "./PageSkeletons";

/**
 * DynamicSkeleton - A flexible skeleton orchestrator that composes different skeleton types
 *
 * @param {Object} props
 * @param {string} props.variant - Skeleton variant for simple skeletons
 * @param {string} props.type - Layout type: 'page' for full layouts, others for simple skeletons
 * @param {string} props.location - Current route location for intelligent defaults
 * @param {Object} props.config - Configuration object
 */
function DynamicSkeleton({
  variant = "rectangular",
  type = "page",
  location = "/",
  config = {},
  ...props
}) {
  const { theme } = useTheme();

  const defaultConfig = {
    showHeader: true,
    showSidebar: false,
    showFooter: false,
    contentType: "default",
    items: 3,
    centered: false,
    animated: true,
    dimensions: {
      headerHeight: 64,
      sidebarWidth: 240,
      footerHeight: 48,
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Determine content type from route patterns
  const routeMappings = [
    { patterns: ["/auth"], type: "form" },
    { patterns: ["/admin", "/merchant"], type: "dashboard" },
    { patterns: ["/products", "/services"], type: "grid" },
    { patterns: ["/profile", "/user"], type: "profile" },
    { patterns: ["/cart"], type: "cart" },
    { patterns: ["/wishlist"], type: "wishlist" },
    { patterns: ["/checkout"], type: "checkout" },
  ];

  if (finalConfig.contentType === "default") {
    const match = routeMappings.find((mapping) =>
      mapping.patterns.some((pattern) => location.includes(pattern))
    );
    // Default to 'home' if no patterns match
    finalConfig.contentType = match ? match.type : "home";
  }

  // Common skeleton props
  const skeletonProps = {
    animation: finalConfig.animated ? "wave" : false,
    sx: { bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.300" },
  };

  // Single skeleton (for simple use cases)
  if (type !== "page") {
    return <Skeleton variant={variant} {...props} {...skeletonProps} />;
  }

  // Main content renderer
  const renderContent = () => {
    const commonProps = { config: finalConfig, skeletonProps };

    switch (finalConfig.contentType) {
      case "form":
        return <FormSkeleton {...commonProps} />;
      case "list":
        return <ListSkeleton {...commonProps} />;
      case "grid":
        return <GridSkeleton {...commonProps} />;
      case "dashboard":
        return <DashboardSkeleton {...commonProps} />;
      case "home":
        return <HomeSkeleton {...commonProps} />;
      case "profile":
        return <ProfileSkeleton {...commonProps} />;
      case "cart":
        return <CartSkeleton {...commonProps} />;
      case "wishlist":
        return <WishlistSkeleton {...commonProps} />;
      case "checkout":
        return <CheckoutSkeleton {...commonProps} />;
      default:
        return <DefaultPageSkeleton {...commonProps} />;
    }
  };

  // Full page layout
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {finalConfig.showHeader && (
        <HeaderSkeleton config={finalConfig} skeletonProps={skeletonProps} />
      )}

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {finalConfig.showSidebar && (
          <SidebarSkeleton config={finalConfig} skeletonProps={skeletonProps} />
        )}
        <Box sx={{ flexGrow: 1, bgcolor: theme.palette.background.default }}>
          {renderContent()}
        </Box>
      </Box>

      {finalConfig.showFooter && (
        <FooterSkeleton config={finalConfig} skeletonProps={skeletonProps} />
      )}
    </Box>
  );
}

export default DynamicSkeleton;
