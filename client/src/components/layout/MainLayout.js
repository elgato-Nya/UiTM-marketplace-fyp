import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import MobileDrawer from "./Header/MobileDrawer";
import FilterSidebar from "./Sidebar/FilterSidebar";

function MainLayout({ showFilters = false, userRole = "guest" }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Determines if the current viewport width matches a mobile device breakpoint
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    // '!' symbol negates the current state - if it's true, it becomes false, and vice versa
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Sticky Header */}
      <Header
        onMenuClick={handleDrawerToggle}
        userRole={userRole}
        isMobile={isMobile}
      />

      {/* Mobile Drawer for navigation */}
      {isMobile && (
        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          userRole={userRole}
        />
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          display: "flex",
          flexGrow: 1,
          pt: { xs: 7, sm: 8 }, // Account for fixed header height
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Desktop Filter Sidebar (only on product pages) */}
        {showFilters && !isMobile && <FilterSidebar />}

        {/* Page Content */}
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            backgroundColor: "background.default",
            minHeight: "inherit",
          }}
        >
          {/* Skip to main content link for accessibility */}
          <Box
            component="a"
            href="#main-content"
            sx={{
              position: "absolute",
              left: "-9999px",
              zIndex: 999,
              padding: 1,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              textDecoration: "none",
              "&:focus": {
                left: "1rem",
                top: "1rem",
              },
            }}
          >
            Skip to main content
          </Box>

          {/* Main Content */}
          <Box
            id="main-content"
            sx={{
              flexGrow: 1,
              width: "100%",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default MainLayout;
