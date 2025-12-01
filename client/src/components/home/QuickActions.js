import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  Dashboard,
  Favorite,
  Receipt,
  TrendingUp,
  People,
  Settings,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";

function QuickActions() {
  const { theme, isAccessible } = useTheme();
  const { isAuthenticated, isConsumer, isMerchant, isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isAuthenticated) return null;

  const getQuickActions = () => {
    const consumerActions = [
      {
        icon: ShoppingCart,
        label: "My Cart",
        path: "/cart",
        color: theme.palette.primary.main,
      },
      {
        icon: Favorite,
        label: "Wishlist",
        path: "/wishlist",
        color: theme.palette.error.main,
      },
      {
        icon: Receipt,
        label: "My Orders",
        path: "/orders/purchases",
        color: theme.palette.info.main,
      },
    ];

    const merchantActions = [
      {
        icon: Store,
        label: "My Store",
        path: "/merchant/store",
        color: theme.palette.success.main,
      },
      {
        icon: TrendingUp,
        label: "Analytics",
        path: "/merchant/analytics",
        color: theme.palette.warning.main,
      },
      {
        icon: Receipt,
        label: "Manage Orders",
        path: "/merchant/orders",
        color: theme.palette.info.main,
      },
    ];

    const adminActions = [
      {
        icon: Dashboard,
        label: "Admin Panel",
        path: "/admin/dashboard",
        color: theme.palette.secondary.main,
      },
      {
        icon: People,
        label: "User Management",
        path: "/admin/users",
        color: theme.palette.primary.main,
      },
      {
        icon: Settings,
        label: "Platform Settings",
        path: "/admin/settings",
        color: theme.palette.text.secondary,
      },
    ];

    let actions = [...consumerActions];
    if (isMerchant) {
      actions = [...actions, ...merchantActions];
    }

    if (isAdmin) {
      actions = [...actions, ...adminActions];
    }

    return actions.slice(0, 6); // Limit to 6 actions for layout purposes
  };

  const quickActions = getQuickActions();

  return (
    <Container maxWidth="lg" sx={{ mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: "medium",
          textAlign: "center",
          color: theme.palette.text.primary,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Quick Actions
      </Typography>

      <Grid container spacing={2} justifyContent="center" alignItems="center">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Grid size={{ xs: 4, md: 2 }} key={index}>
              <Card
                component={Link}
                to={action.path}
                sx={{
                  textDecoration: "none",
                  height: "100%",
                  bgcolor: theme.palette.background.paper,
                  border: isAccessible
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: isAccessible ? "none" : theme.shadows[4],
                    bgcolor: isAccessible
                      ? theme.palette.background.default
                      : theme.palette.background.paper,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  <IconButton
                    sx={{
                      bgcolor: `${action.color}15`, // 15% opacity background
                      color: action.color,
                      mb: 1,
                      "&:hover": {
                        bgcolor: `${action.color}25`, // 25% opacity on hover
                      },
                    }}
                  >
                    <Icon />
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    {action.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default QuickActions;
