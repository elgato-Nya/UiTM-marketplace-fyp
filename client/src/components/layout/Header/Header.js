import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, KeyboardArrowDown } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import useCart from "../../../features/cart/hook/useCart";
import useWishlist from "../../../features/wishlist/hook/useWishlist";
import { ROUTES } from "../../../constants/routes";
import ThemeToggle from "../../common/ThemeToggle";
import UserMenu from "./UserMenu";
import BrowseMenu from "./navigation/BrowseMenu";
import MerchantMenu from "./navigation/MerchantMenu";
import AdminMenu from "./navigation/AdminMenu";
import AboutMenu from "./navigation/AboutMenu";
import ActionButtons from "./navigation/ActionButtons";

function Header({ onMenuClick, userRole, isMobile }) {
  const { theme } = useTheme();
  const { isAuthenticated, user, isConsumer, isMerchant, isAdmin } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [browseMenuAnchor, setBrowseMenuAnchor] = useState(null);
  const [merchantMenuAnchor, setMerchantMenuAnchor] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [aboutMenuAnchor, setAboutMenuAnchor] = useState(null);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleBrowseMenuOpen = (event) => {
    setBrowseMenuAnchor(event.currentTarget);
  };

  const handleBrowseMenuClose = () => {
    setBrowseMenuAnchor(null);
  };

  const handleMerchantMenuOpen = (event) => {
    setMerchantMenuAnchor(event.currentTarget);
  };

  const handleMerchantMenuClose = () => {
    setMerchantMenuAnchor(null);
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const handleAboutMenuOpen = (event) => {
    setAboutMenuAnchor(event.currentTarget);
  };

  const handleAboutMenuClose = () => {
    setAboutMenuAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(10px)",
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 0.5, sm: 1, md: 2 },
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: 56, sm: 64 },
          justifyContent: "space-between",
          overflow: "visible",
        }}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to={ROUTES.HOME}
          sx={{
            textDecoration: "none",
            color: theme.palette.primary.main,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: "fit-content",
          }}
        >
          🎓
          {!isSmallScreen && "UiTM Marketplace"}
          {isSmallScreen && "UiTM"}
        </Typography>

        {/* Spacer to push navigation to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={Link}
              to={ROUTES.HOME}
              sx={{
                color: theme.palette.text.primary,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Home
            </Button>

            {/* Browse Dropdown */}
            <Button
              onClick={handleBrowseMenuOpen}
              endIcon={<KeyboardArrowDown />}
              sx={{
                color: theme.palette.text.primary,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Browse
            </Button>
            <BrowseMenu
              anchorEl={browseMenuAnchor}
              open={Boolean(browseMenuAnchor)}
              onClose={handleBrowseMenuClose}
            />

            {/* Orders - Only for authenticated users */}
            {isAuthenticated && (
              <Button
                component={Link}
                to={ROUTES.ORDERS.PURCHASES}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                Orders
              </Button>
            )}

            {/* Merchant Dashboard Dropdown - Only for merchants */}
            {isMerchant && (
              <>
                <Button
                  onClick={handleMerchantMenuOpen}
                  endIcon={<KeyboardArrowDown />}
                  sx={{
                    color: theme.palette.secondary.main,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    },
                  }}
                >
                  Merchant
                </Button>
                <MerchantMenu
                  anchorEl={merchantMenuAnchor}
                  open={Boolean(merchantMenuAnchor)}
                  onClose={handleMerchantMenuClose}
                />
              </>
            )}

            {/* Admin Dashboard Dropdown - Only for admins */}
            {isAdmin && (
              <>
                <Button
                  onClick={handleAdminMenuOpen}
                  endIcon={<KeyboardArrowDown />}
                  sx={{
                    color: theme.palette.error.main,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  Admin
                </Button>
                <AdminMenu
                  anchorEl={adminMenuAnchor}
                  open={Boolean(adminMenuAnchor)}
                  onClose={handleAdminMenuClose}
                />
              </>
            )}

            {/* About Us Dropdown */}
            <Button
              onClick={handleAboutMenuOpen}
              endIcon={<KeyboardArrowDown />}
              sx={{
                color: theme.palette.text.primary,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              About
            </Button>
            <AboutMenu
              anchorEl={aboutMenuAnchor}
              open={Boolean(aboutMenuAnchor)}
              onClose={handleAboutMenuClose}
            />
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            flexShrink: 0,
          }}
        >
          {/* Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Only show action buttons on desktop */}
              {!isMobile && (
                <ActionButtons
                  isSmallScreen={isSmallScreen}
                  cartCount={cartCount}
                  wishlistCount={wishlistCount}
                  onUserMenuOpen={handleUserMenuOpen}
                  theme={theme}
                />
              )}

              <UserMenu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                user={user}
              />
            </>
          ) : (
            <>
              {/* Guest Actions */}
              <Button
                component={Link}
                to={ROUTES.AUTH.LOGIN}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: "none",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to={ROUTES.AUTH.REGISTER}
                variant="contained"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {isSmallScreen ? "Join" : "Sign Up"}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
