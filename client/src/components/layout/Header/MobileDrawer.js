import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Button,
  alpha,
} from "@mui/material";
import { Login, PersonAdd } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";
import { ROUTES } from "../../../constants/routes";
import DrawerHeader from "./drawer/DrawerHeader";
import DrawerSection from "./drawer/DrawerSection";
import { getGuestMenuItems, getAuthMenuSections } from "./config/menuConfig";

function MobileDrawer({ open, onClose }) {
  const { theme } = useTheme();
  const { isAuthenticated, user, isConsumer, isMerchant, isAdmin, logoutUser } =
    useAuth();

  const guestMenuItems = getGuestMenuItems();
  const authMenuSections = getAuthMenuSections({
    isConsumer,
    isMerchant,
    isAdmin,
  });

  const handleItemClick = () => {
    onClose();
  };

  const handleLogout = () => {
    logoutUser();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {/* Header */}
      <DrawerHeader
        theme={theme}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Menu Items */}
      <List sx={{ pt: 0 }}>
        {!isAuthenticated ? (
          <>
            {/* Guest Menu */}
            {guestMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.link}
                  onClick={handleItemClick}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Auth Buttons */}
            <Box
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Button
                component={Link}
                to={ROUTES.AUTH.LOGIN}
                onClick={handleItemClick}
                startIcon={<Login />}
                variant="outlined"
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to={ROUTES.AUTH.REGISTER}
                onClick={handleItemClick}
                startIcon={<PersonAdd />}
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Sign Up
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Browse Section */}
            <DrawerSection
              title={authMenuSections.browse.title}
              items={authMenuSections.browse.items}
              onItemClick={handleItemClick}
              theme={theme}
              collapsible={authMenuSections.browse.collapsible}
            />

            {/* Account Section */}
            <DrawerSection
              title={authMenuSections.account.title}
              items={authMenuSections.account.items}
              onItemClick={handleItemClick}
              theme={theme}
              collapsible={authMenuSections.account.collapsible}
            />

            {/* Merchant Section */}
            {authMenuSections.merchant.show && (
              <DrawerSection
                title={authMenuSections.merchant.title}
                items={authMenuSections.merchant.items}
                onItemClick={handleItemClick}
                theme={theme}
                color={theme.palette.secondary.main}
                collapsible={authMenuSections.merchant.collapsible}
              />
            )}

            {/* Admin Section */}
            {authMenuSections.admin.show && (
              <DrawerSection
                title={authMenuSections.admin.title}
                items={authMenuSections.admin.items}
                onItemClick={handleItemClick}
                theme={theme}
                color={theme.palette.error.main}
                collapsible={authMenuSections.admin.collapsible}
              />
            )}

            {/* About Section */}
            <DrawerSection
              title={authMenuSections.about.title}
              items={authMenuSections.about.items}
              onItemClick={handleItemClick}
              theme={theme}
              collapsible={authMenuSections.about.collapsible}
            />

            {/* Settings & Help Section */}
            <DrawerSection
              title={authMenuSections.settings.title}
              items={authMenuSections.settings.items}
              onItemClick={handleItemClick}
              theme={theme}
              collapsible={authMenuSections.settings.collapsible}
            />

            <Divider sx={{ my: 1 }} />

            {/* Logout Button */}
            <Box sx={{ p: 2 }}>
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="error"
                fullWidth
                sx={{ textTransform: "none" }}
              >
                Logout
              </Button>
            </Box>
          </>
        )}
      </List>
    </Drawer>
  );
}

export default MobileDrawer;
