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
  Avatar,
  Button,
  Tooltip,
  alpha,
  Collapse,
  ListSubheader,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  ShoppingBag,
  Store,
  BarChart,
  Settings,
  Home as HomeIcon,
  Receipt,
  Assessment,
  Logout as LogoutIcon,
  Close as CloseIcon,
  ChevronLeft,
  ExpandMore,
  ExpandLess,
  VerifiedUser,
  LocalOffer,
  AttachMoney,
  ContactMail,
  Chat,
} from "@mui/icons-material";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  ROUTES,
  MERCHANT_SIDEBAR,
  ADMIN_SIDEBAR,
} from "../../constants/routes";
import ThemeToggle from "../common/ThemeToggle";
import { useMerchant } from "../../features/merchant/hooks/useMerchant";

const DRAWER_WIDTH = 280;

function DashboardLayout({ userRole }) {
  const { theme } = useTheme();
  const { isAuthenticated, user, isConsumer, isMerchant, isAdmin, logoutUser } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState({});

  // Get shop info for merchant
  const { shop, loadMyShop } = useMerchant();

  // Load shop data on mount for merchants
  React.useEffect(() => {
    if (userRole === "merchant" && !shop) {
      loadMyShop();
    }
  }, [userRole, shop]);

  // Initialize all group states on mount
  React.useEffect(() => {
    const groups = userRole === "admin" ? ADMIN_SIDEBAR : MERCHANT_SIDEBAR;
    const initialState = {};

    groups.forEach((group) => {
      if (
        group.group &&
        group.collapsible !== false &&
        group.items?.length > 1
      ) {
        initialState[group.group] = group.defaultOpen !== false;
      }
    });

    setOpenGroups(initialState);
  }, [userRole]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const handleLogout = () => {
    logoutUser();
    navigate(ROUTES.HOME);
  };

  // Get display name
  const getDisplayName = () => {
    if (userRole === "merchant" && shop?.shopName) {
      return shop.shopName;
    }
    return user?.profile?.username || user?.email?.split("@")[0] || "User";
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
    VerifiedUser: <VerifiedUser />,
    LocalOffer: <LocalOffer />,
    AttachMoney: <AttachMoney />,
    ContactMail: <ContactMail />,
    Chat: <Chat />,
  };

  // Toggle group expansion
  const handleToggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Get navigation groups from constants (supports both flat and grouped structures)
  const getNavigationGroups = (role) => {
    const items = role === "admin" ? ADMIN_SIDEBAR : MERCHANT_SIDEBAR;

    // Check if the structure is grouped (has 'group' property)
    const isGrouped = items.length > 0 && items[0].group !== undefined;

    if (isGrouped) {
      // Return grouped structure as-is
      return items;
    } else {
      // Convert flat structure to grouped format for backward compatibility
      return [
        {
          group: "Navigation",
          items: items.map((item) => ({
            label: item.label,
            icon: item.icon,
            path: item.path,
          })),
        },
      ];
    }
  };

  const navigationGroups = {
    admin: getNavigationGroups("admin"),
    merchant: getNavigationGroups("merchant"),
  };

  const drawer = (
    <>
      {/* Header with User Info */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 0.5,
              }}
            >
              {getDisplayName()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 0.5,
              }}
            >
              {user?.email || ""}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {userRole === "admin" ? "Admin Panel" : "Merchant Dashboard"}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(false)}
              size="small"
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Primary Action: Back to Site */}
      <Box sx={{ p: 2, pt: 3 }}>
        <Button
          component={Link}
          to={ROUTES.HOME}
          variant="contained"
          fullWidth
          startIcon={<HomeIcon />}
          onClick={() => isMobile && setMobileOpen(false)}
          sx={{
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          Back to Site
        </Button>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation Groups */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navigationGroups[userRole]?.map((group, groupIndex) => {
          const isGroupOpen = openGroups[group.group] ?? true; // Default to open if not set
          const hasMultipleItems = group.items?.length > 1;
          const isCollapsible = group.collapsible !== false && hasMultipleItems;

          return (
            <Box key={groupIndex} sx={{ mb: 2 }}>
              {/* Group Header */}
              {group.group && (
                <ListSubheader
                  component="div"
                  sx={{
                    backgroundColor: "transparent",
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    lineHeight: "32px",
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: isCollapsible ? "pointer" : "default",
                    "&:hover": isCollapsible
                      ? {
                          color: theme.palette.primary.main,
                        }
                      : {},
                  }}
                  onClick={
                    isCollapsible
                      ? () => handleToggleGroup(group.group)
                      : undefined
                  }
                >
                  <span>{group.group}</span>
                  {isCollapsible &&
                    (isGroupOpen ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    ))}
                </ListSubheader>
              )}

              {/* Group Items */}
              <Collapse
                in={!isCollapsible || isGroupOpen}
                timeout="auto"
                unmountOnExit
              >
                {group.items?.map((item, itemIndex) => {
                  const isActive = location.pathname === item.path;
                  const icon = iconMap[item.icon] || item.icon;

                  return (
                    <ListItem key={itemIndex} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        onClick={() => isMobile && setMobileOpen(false)}
                        sx={{
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                          backgroundColor: isActive
                            ? alpha(theme.palette.primary.main, 0.12)
                            : "transparent",
                          "&:hover": {
                            backgroundColor: isActive
                              ? alpha(theme.palette.primary.main, 0.16)
                              : alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            minWidth: 40,
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "0.95rem",
                            color: isActive ? "primary.main" : "text.primary",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Collapse>
            </Box>
          );
        })}
      </List>

      {/* Mobile Only: Logout Button at Bottom */}
      {isMobile && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ p: 2 }}>
            <Button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogoutIcon />}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Logout
            </Button>
          </Box>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          ml: { md: desktopOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(10px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Desktop: Toggle Sidebar Button */}
          {!isMobile && (
            <Tooltip
              title={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <IconButton
                color="inherit"
                onClick={handleDesktopDrawerToggle}
                edge="start"
                sx={{ mr: 1 }}
              >
                {desktopOpen ? <ChevronLeft /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
          )}

          {/* Welcome Message with User Info */}
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}
          >
            <Avatar
              src={user?.profile?.avatar}
              alt={getDisplayName()}
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                display: { xs: "none", sm: "flex" },
              }}
            >
              {getDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.2, display: { xs: "none", sm: "block" } }}
              >
                Welcome back,
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ lineHeight: 1.2 }}
              >
                {getDisplayName()}
              </Typography>
            </Box>
          </Box>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop: Logout Button with Text */}
          <Button
            onClick={handleLogout}
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              display: { xs: "none", md: "inline-flex" },
            }}
          >
            Logout
          </Button>

          {/* Mobile: Menu Button on RIGHT */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? DRAWER_WIDTH : 0 },
          flexShrink: { md: 0 },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Mobile Drawer - Opens from RIGHT */}
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.paper,
              borderLeft: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {/* Mobile Header with Close Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {drawer}
        </Drawer>

        {/* Desktop Drawer - Permanent but Collapsible */}
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
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
          p: { xs: 2, md: 3 },
          width: "100%",
          mt: "64px", // Account for AppBar height
          minHeight: "calc(100vh - 64px)",
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
