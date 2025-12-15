import React from "react";
import { Box, Grid, Container, Typography, ButtonBase } from "@mui/material";
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
  const { theme } = useTheme();
  const { isAuthenticated, isMerchant, isAdmin } = useAuth();

  if (!isAuthenticated) return null;

  const getQuickActions = () => {
    const consumerActions = [
      {
        icon: ShoppingCart,
        label: "My Cart",
        path: "/cart",
      },
      {
        icon: Favorite,
        label: "Wishlist",
        path: "/wishlist",
      },
      {
        icon: Receipt,
        label: "My Orders",
        path: "/orders/purchases",
      },
    ];

    const merchantActions = [
      {
        icon: Store,
        label: "My Store",
        path: "/merchant/store",
      },
      {
        icon: TrendingUp,
        label: "Analytics",
        path: "/merchant/analytics",
      },
      {
        icon: Receipt,
        label: "Manage Orders",
        path: "/merchant/orders",
      },
    ];

    const adminActions = [
      {
        icon: Dashboard,
        label: "Admin Panel",
        path: "/admin/dashboard",
      },
      {
        icon: People,
        label: "User Management",
        path: "/admin/users",
      },
      {
        icon: Settings,
        label: "Platform Settings",
        path: "/admin/settings",
      },
    ];

    let actions = [...consumerActions];
    if (isMerchant) actions = [...actions, ...merchantActions];
    if (isAdmin) actions = [...actions, ...adminActions];
    return actions.slice(0, 6);
  };

  const quickActions = getQuickActions();

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        py: { xs: 2.5, sm: 3.5, md: 4.5 },
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: { xs: 2, sm: 2.5, md: 3 },
            fontWeight: 600,
            textAlign: "center",
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Quick Actions
        </Typography>
        <Grid
          container
          spacing={{ xs: 0.75, sm: 1.5, md: 2 }}
          sx={{
            maxWidth: 900,
            mx: "auto",
          }}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Grid key={index} size={{ xs: 4, sm: 4, md: 2 }}>
                <ButtonBase
                  component={Link}
                  to={action.path}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 0.75, md: 1 },
                    p: { xs: 1, sm: 1.5, md: 2 },
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: { xs: 1.5, md: 2 },
                    transition: "all 0.15s ease",
                    minHeight: { xs: 70, sm: 85, md: 95 },
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                      "& .icon": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                    },
                  }}
                >
                  <Box
                    className="icon"
                    sx={{
                      width: { xs: 32, sm: 38, md: 42 },
                      height: { xs: 32, sm: 38, md: 42 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: { xs: 1, md: 1.5 },
                      color: "primary.main",
                      // border: "1px solid",
                      // borderColor: "primary.main",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: {
                        xs: "0.625rem",
                        sm: "0.6875rem",
                        md: "0.75rem",
                      },
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {action.label}
                  </Typography>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default QuickActions;
