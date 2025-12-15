import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Skeleton,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Refresh, Info } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useSnackbar } from "../../hooks/useSnackbar";
import useAdminDashboard from "../../features/admin/hooks/useAdminDashboard";
import QuickStats from "../../features/admin/components/QuickStats";
import PlatformOverview from "../../features/admin/components/PlatformOverview";
import RecentActivity from "../../features/admin/components/RecentActivity";
import PendingVerifications from "../../features/admin/components/PendingVerifications";

/**
 * AdminDashboardPage Component
 *
 * PURPOSE: Main admin dashboard landing page
 * FEATURES:
 * - Overview statistics
 * - Recent activity timeline
 * - Pending verification alerts
 * - Auto-refresh every 30 seconds
 * - Manual refresh with rate limiting
 * - Grouped sidebar navigation (User, Merchant, Content, Communication, Analytics)
 *
 * ACCESSIBILITY:
 * - Proper heading hierarchy (h1 -> h2 -> h3)
 * - ARIA labels for actions
 * - Loading states announced
 * - Error states with proper alerts
 *
 * RESPONSIVE:
 * - Mobile-first layout
 * - Grid system for components
 * - Stacked on small screens
 */
const AdminDashboardPage = () => {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();

  const {
    overview,
    pendingVerifications,
    currentPeriod,
    periodData,
    isLoading,
    isRefreshing,
    error,
    refresh,
    changePeriod,
  } = useAdminDashboard();

  // Note: loadDashboard is called internally in useAdminDashboard hook
  // No need to call it here to avoid duplicate API calls

  const handleRefresh = async () => {
    await refresh();
    // Snackbar notifications are handled inside the refresh function
  };

  // Loading skeleton
  if (isLoading && !overview) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
        </Box>

        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12 }}>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // This allows users to still access Quick Actions even when API fails
  const showErrorBanner = error && !overview;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 0.5,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.8125rem", md: "0.875rem" },
            }}
          >
            Monitor platform performance and manage operations
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh dashboard data" placement="top">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh dashboard"
                color="primary"
                size="small"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Banner - Show when data fails to load */}
      {showErrorBanner && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Failed to Load Dashboard Data
          </Typography>
          <Typography variant="body2">
            {error ||
              "Unable to fetch data from server. Please try again or check your connection."}
          </Typography>
        </Alert>
      )}

      {/* Pending Verifications Alert */}
      {pendingVerifications && pendingVerifications.totalPending > 0 && (
        <PendingVerifications
          pendingCount={pendingVerifications.totalPending}
          merchantsPending={pendingVerifications.merchants || 0}
          usersPending={pendingVerifications.users || 0}
        />
      )}

      {/* Quick Stats - Always show even when no data */}
      <Box sx={{ mb: 3 }}>
        <QuickStats data={periodData} isLoading={isLoading} />
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Platform Overview */}
        {overview && (
          <Grid size={{ xs: 12 }}>
            <PlatformOverview
              overview={overview}
              currentPeriod={currentPeriod}
              onPeriodChange={changePeriod}
              isLoading={isLoading}
            />
          </Grid>
        )}

        {/* Recent Activity - only show if data exists */}
        {periodData && periodData.recentActivity && (
          <Grid>
            <RecentActivity
              activities={periodData.recentActivity}
              isLoading={isLoading}
            />
          </Grid>
        )}
      </Grid>

      {/* Loading overlay for refresh */}
      {isRefreshing && overview && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              height: "100%",
              backgroundColor: theme.palette.primary.main,
              animation: "loading 1.5s ease-in-out infinite",
              "@keyframes loading": {
                "0%": { width: "0%", marginLeft: "0%" },
                "50%": { width: "50%", marginLeft: "25%" },
                "100%": { width: "0%", marginLeft: "100%" },
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
