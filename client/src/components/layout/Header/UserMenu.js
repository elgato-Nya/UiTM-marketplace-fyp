import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Person,
  Settings,
  Logout,
  LocationOn,
  Notifications,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { ROUTES } from "../../../constants/routes";

function UserMenu({ anchorEl, open, onClose, user }) {
  const { theme } = useTheme();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    onClose();
  };

  const menuItems = [
    // Profile section
    {
      icon: <Person />,
      text: "My Profile",
      link: ROUTES.PROFILE.INDEX,
      show: true,
    },
    {
      icon: <LocationOn />,
      text: "My Addresses",
      link: ROUTES.PROFILE.ADDRESSES,
      show: true,
    },
    {
      icon: <Settings />,
      text: "Account Settings",
      link: ROUTES.SETTINGS,
      show: true,
    },
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 220,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* User Info Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user?.profile?.avatar}
            alt={user?.profile?.username || user?.email}
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            {user?.profile?.username
              ? user.profile.username.charAt(0).toUpperCase()
              : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.profile?.username || "User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      {menuItems
        .filter((item) => item.show)
        .map((item, index) => (
          <MenuItem
            key={index}
            component={Link}
            to={item.link}
            sx={{
              py: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}

      <Divider />

      {/* Logout */}
      <MenuItem
        onClick={handleLogout}
        sx={{
          py: 1,
          color: theme.palette.error.main,
          "&:hover": {
            backgroundColor: alpha(theme.palette.error.main, 0.1),
          },
        }}
      >
        <ListItemIcon sx={{ color: theme.palette.error.main }}>
          <Logout />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default UserMenu;
