import React, { useState } from "react";
import { Box, IconButton, Badge, Tooltip, Avatar } from "@mui/material";
import {
  ShoppingCart,
  Favorite as FavoriteIcon,
  Notifications,
  AccountCircle,
  ChatBubbleOutline as ChatIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../../../constants/routes";
import { useNotificationContext } from "../../../../contexts/NotificationContext";
import { selectTotalUnread } from "../../../../features/chat/store/chatSlice";
import NotificationDropdown from "../../../notification/NotificationDropdown";

function ActionButtons({
  isSmallScreen,
  cartCount,
  wishlistCount,
  onUserMenuOpen,
  theme,
  user,
}) {
  const { unreadCount } = useNotificationContext();
  const chatUnreadCount = useSelector(selectTotalUnread);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  return (
    <>
      {/* Notifications */}
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleNotifOpen}
          size={isSmallScreen ? "small" : "medium"}
          aria-label={`${unreadCount} unread notifications`}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications fontSize={isSmallScreen ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationDropdown
        anchorEl={notifAnchorEl}
        onClose={handleNotifClose}
      />

      {/* Messages */}
      <Tooltip title="Messages">
        <IconButton
          color="inherit"
          component={Link}
          to={ROUTES.CHAT.INDEX}
          aria-label={`${chatUnreadCount} unread messages`}
          size={isSmallScreen ? "small" : "medium"}
        >
          <Badge badgeContent={chatUnreadCount} color="error">
            <ChatIcon fontSize={isSmallScreen ? "small" : "medium"} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Shopping Cart */}
      <Tooltip title="Shopping Cart">
        <IconButton
          color="inherit"
          component={Link}
          to={ROUTES.CART}
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
          to={ROUTES.WISHLIST}
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
            p: 0,
          }}
        >
          <Avatar
            src={user?.profile?.avatar}
            alt={user?.profile?.username || user?.email}
            sx={{
              bgcolor: theme.palette.primary.main,
              width: isSmallScreen ? 32 : 36,
              height: isSmallScreen ? 32 : 36,
              fontSize: isSmallScreen ? "0.875rem" : "1rem",
              fontWeight: 600,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            {user?.profile?.username
              ? user.profile.username.charAt(0).toUpperCase()
              : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
          </Avatar>
        </IconButton>
      </Tooltip>
    </>
  );
}

export default ActionButtons;
