import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  useMediaQuery,
  Drawer,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { Link, useLocation, Outlet } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { getProfileNavigation } from "../../config/profile/profileNavigation";

function ProfileLayout() {
  const { theme } = useTheme();
  const { user, roles } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = getProfileNavigation(roles);
  const currentPath = location.pathname;

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavigationContent = () => (
    <Box sx={{ width: 280, height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.primary.main + "08",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: "bold",
            }}
          >
            {user?.profile?.username?.charAt(0).toUpperCase() || "U"}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, truncate: true }}>
              {user?.profile?.username || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Role Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {roles.map((role) => {
            <Chip
              key={role}
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              size="small"
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                textTransform: "capitalize",
              }}
            />;
          })}
        </Box>
      </Box>

      {/* Navigation  */}
      <List sx={{ px: 1, py: 2 }}>
        {navigation.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/profile" && currentPath.startsWith(item.path));
          const Icon = item.icon;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive
                    ? theme.palette.primary.main + "15"
                    : "transparent",
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  "&:hover": {
                    bgcolor: theme.palette.primary.main + "08",
                  },
                }}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? "page" : undefined}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 600 : 400,
                    },
                    secondary: {
                      fontSize: "0.75rem",
                      sx: { display: { xs: "none", lg: "block" } },
                    },
                  }}
                />
                {item.isMerchant && (
                  <Chip
                    label="Store"
                    size="small"
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: "white",
                      fontSize: "0.7rem",
                      height: 20,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/*Desktop Sidebar */}
        {!isMobile && (
          <Grid item md={3}>
            <Paper
              elevation={1}
              sx={{
                position: "sticky",
                top: 100,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <NavigationContent />
            </Paper>
          </Grid>
        )}

        {/* Main Content */}
        <Grid item size={{ xs: 12, md: 9 }}>
          {/* Mobile Header */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                p: 2,
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{ mr: 2 }}
                aria-label="Open navigation menu"
                aria-haspopup="true"
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Account Settings
              </Typography>
            </Box>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              anchor="left"
              open={mobileMenuOpen}
              onClose={handleMobileMenuToggle}
              slotProps={{
                paper: {
                  sx: { bgcolor: theme.palette.background.paper },
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                <IconButton
                  onClick={handleMobileMenuToggle}
                  aria-label="Close navigation menu"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <NavigationContent />
            </Drawer>
          )}

          {/* Page Content */}
          <Box
            component="main"
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <Outlet />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProfileLayout;
