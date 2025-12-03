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
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 300,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: "none",
          },
        },
      }}
    >
      {/* Header */}
      <DrawerHeader
        theme={theme}
        isAuthenticated={isAuthenticated}
        user={user}
        onClose={onClose}
      />

      {/* Menu Items */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 120px)",
        }}
      >
        <List sx={{ pt: 0, pb: 2, flex: 1, overflow: "auto" }}>
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
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: theme.palette.primary.main,
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: { fontWeight: 500 },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Auth Buttons */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Button
                  component={Link}
                  to={ROUTES.AUTH.LOGIN}
                  onClick={handleItemClick}
                  startIcon={<Login />}
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    textTransform: "none",
                    py: 1.2,
                    borderWidth: 2,
                    fontWeight: 600,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
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
                  size="large"
                  sx={{
                    textTransform: "none",
                    py: 1.2,
                    fontWeight: 600,
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
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
            </>
          )}
        </List>

        {/* Logout Button - Fixed at Bottom */}
        {isAuthenticated && (
          <>
            <Divider />
            <Box sx={{ p: 2, mt: "auto" }}>
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                sx={{
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 600,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default MobileDrawer;
