import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  alpha,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  KeyboardArrowDown,
  ShoppingCart as CartIcon,
  Favorite as WishlistIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import useCart from "../../../features/cart/hook/useCart";
import useWishlist from "../../../features/wishlist/hook/useWishlist";
import { ROUTES } from "../../../constants/routes";
import ThemeToggle from "../../common/ThemeToggle";
import UserMenu from "./UserMenu";
import BrowseMenu from "./navigation/BrowseMenu";
import MerchantMenu from "./navigation/MerchantMenu";
import AboutMenu from "./navigation/AboutMenu";
import ActionButtons from "./navigation/ActionButtons";

function Header({ onMenuClick, userRole, isMobile }) {
  const { theme } = useTheme();
  const { isAuthenticated, user, isMerchant, isAdmin } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [browseMenuAnchor, setBrowseMenuAnchor] = useState(null);
  const [merchantMenuAnchor, setMerchantMenuAnchor] = useState(null);
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
        {/* Left Side: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            🎓 UiTM Marketplace
          </Typography>
        </Box>

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

            {/* Admin Dashboard Button - Only for admins */}
            {isAdmin && (
              <Button
                component={Link}
                to={ROUTES.ADMIN.DASHBOARD}
                sx={{
                  color: theme.palette.error.main,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                Admin Dashboard
              </Button>
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
              {/* Cart Icon - Show on Mobile */}
              {isMobile && (
                <IconButton
                  component={Link}
                  to={ROUTES.CART}
                  color="inherit"
                  size="small"
                >
                  <Badge badgeContent={cartCount} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
              )}

              {/* Wishlist Icon - Show on Mobile */}
              {isMobile && (
                <IconButton
                  component={Link}
                  to={ROUTES.WISHLIST}
                  color="inherit"
                  size="small"
                >
                  <Badge badgeContent={wishlistCount} color="error">
                    <WishlistIcon />
                  </Badge>
                </IconButton>
              )}

              {/* Only show action buttons on desktop */}
              {!isMobile && (
                <ActionButtons
                  isSmallScreen={isSmallScreen}
                  cartCount={cartCount}
                  wishlistCount={wishlistCount}
                  onUserMenuOpen={handleUserMenuOpen}
                  theme={theme}
                  user={user}
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
              {/* Guest Actions - Desktop */}
              {!isMobile && (
                <>
                  <Button
                    component={Link}
                    to={ROUTES.AUTH.LOGIN}
                    sx={{
                      color: theme.palette.text.primary,
                      textTransform: "none",
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
                    Sign Up
                  </Button>
                </>
              )}
            </>
          )}

          {/* Mobile Menu Button - Right Side for Right-Hand Users */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={onMenuClick}
              sx={{ ml: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
