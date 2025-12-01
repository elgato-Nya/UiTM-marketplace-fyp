import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  ShoppingBag,
  Store,
  BarChart,
  Settings,
  ExitToApp,
  Receipt,
  Assessment,
} from "@mui/icons-material";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  ROUTES,
  MERCHANT_SIDEBAR,
  ADMIN_SIDEBAR,
} from "../../constants/routes";
import ThemeToggle from "../common/ThemeToggle";

const DRAWER_WIDTH = 280;

// ? should i put a default value?? and what it is??
function DashboardLayout({ userRole }) {
  const { theme } = useTheme();
  const { isAuthenticated, user, isConsumer, isMerchant, isAdmin, logoutUser } =
    useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logoutUser();
    navigate(ROUTES.HOME);
  };

  // Icon mapping for sidebar items
  const iconMap = {
    Dashboard: <Dashboard />,
    People: <People />,
    ShoppingBag: <ShoppingBag />,
    Store: <Store />,
    Analytics: <BarChart />,
    Receipt: <Receipt />,
    Assessment: <Assessment />,
    Settings: <Settings />,
  };

  // Get navigation items from constants
  const getNavigationItems = (role) => {
    const items = role === "admin" ? ADMIN_SIDEBAR : MERCHANT_SIDEBAR;
    return items.map((item) => ({
      text: item.label,
      icon: iconMap[item.icon],
      path: item.path,
    }));
  };

  const navigationItems = {
    admin: getNavigationItems("admin"),
    merchant: getNavigationItems("merchant"),
  };

  const drawer = (
    <>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: "bold",
          }}
        >
          UiTM Marketplace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {userRole === "admin" ? "Admin Panel" : "Merchant Dashboard"}
        </Typography>
      </Box>

      <List>
        {navigationItems[userRole]?.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "10",
                },
              }}
            >
              {" "}
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={ROUTES.HOME}
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.primary.main + "10",
              },
            }}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Back to Site" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome back, {user?.name || "User"}
          </Typography>

          <ThemeToggle />

          <IconButton onClick={handleLogout} color="inherit">
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px", // Account for AppBar height
          minHeight: "calc(100vh - 64px)",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
