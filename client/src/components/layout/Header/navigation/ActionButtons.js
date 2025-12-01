import React from "react";
import { Box, IconButton, Badge, Tooltip } from "@mui/material";
import {
  ShoppingCart,
  Favorite as FavoriteIcon,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

function ActionButtons({
  isSmallScreen,
  cartCount,
  wishlistCount,
  onUserMenuOpen,
  theme,
}) {
  return (
    <>
      {/* Notifications */}
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          component={Link}
          to={ROUTES.NOTIFICATIONS}
          size={isSmallScreen ? "small" : "medium"}
        >
          <Badge badgeContent={3} color="error">
            <Notifications fontSize={isSmallScreen ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Shopping Cart */}
      <Tooltip title="Shopping Cart">
        <IconButton
          color="inherit"
          component={Link}
          to="/cart"
          aria-label={`Shopping cart with ${cartCount} items`}
          size={isSmallScreen ? "small" : "medium"}
        >
          <Badge badgeContent={cartCount} color="primary">
            <ShoppingCart fontSize={isSmallScreen ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Wishlist */}
      <Tooltip title="Wishlist">
        <IconButton
          color="inherit"
          component={Link}
          to="/wishlist"
          aria-label={`Wishlist with ${wishlistCount} items`}
          size={isSmallScreen ? "small" : "medium"}
        >
          <Badge badgeContent={wishlistCount} color="secondary">
            <FavoriteIcon fontSize={isSmallScreen ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* User Menu */}
      <Tooltip title="Account">
        <IconButton
          color="inherit"
          onClick={onUserMenuOpen}
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            p: 0.5,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: "50%",
          }}
        >
          <AccountCircle sx={{ fontSize: isSmallScreen ? 24 : 28 }} />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default ActionButtons;
