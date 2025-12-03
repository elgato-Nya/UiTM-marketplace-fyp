import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Alert,
  Fade,
  Collapse,
  IconButton,
  Tooltip,
  useMediaQuery,
  Divider,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  Inventory,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  InfoOutlined,
  Assessment,
  Star,
  Storefront,
  Visibility,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { useMerchantAnalytics } from "../../features/analytic/hooks/useMerchantAnalytics";
import { useMerchant } from "../../features/merchant/hooks/useMerchant";
import StatCard from "../../features/analytic/components/StatCard";
import RevenueChart from "../../features/analytic/components/RevenueChart";
import OrdersChart from "../../features/analytic/components/OrdersChart";
import FilterBar from "../../features/analytic/components/FilterBar";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTheme } from "../../hooks/useTheme";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  PERIOD_LABELS,
} from "../../constants/analyticsConstant";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";

/**
 * MerchantAnalyticsPage
 *
 * PURPOSE: Main analytics dashboard for merchants
 * PATTERN: Matches SalesPage.js structure
 *
 * Features:
 * - Period filtering (week, month, year)
 * - Key metrics (revenue, orders, listings)
 * - Revenue trend chart
 * - Order status distribution chart
 * - Manual refresh
 */
const MerchantAnalyticsPage = () => {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Collapsible sections state for mobile
  const [showAdditionalMetrics, setShowAdditionalMetrics] = useState(!isMobile);
  const [showCharts, setShowCharts] = useState(true);

  const {
    analytics,
    currentPeriod,
    isLoading,
    isRefreshing,
    error,
    loadAnalytics,
    changePeriod,
    refresh,
    clearError,
  } = useMerchantAnalytics("week");

  // Fetch shop metrics for overall stats
  const {
    shop,
    loadMyShop,
    syncListings,
    isUpdating,
    success,
    error: shopError,
    clearSuccessMessage,
  } = useMerchant();

  // Load shop data on mount
  useEffect(() => {
    loadMyShop();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      showSnackbar(error, "error");
      clearError();
    }
  }, [error, showSnackbar, clearError]);

  useEffect(() => {
    if (shopError) {
      showSnackbar(shopError.message || "Failed to load shop data", "error");
    }
  }, [shopError, showSnackbar]);

  // Handle sync success
  useEffect(() => {
    if (success) {
      showSnackbar(success.message, "success");
      clearSuccessMessage();
      // Reload shop data after sync
      loadMyShop();
    }
  }, [success, showSnackbar, clearSuccessMessage, loadMyShop]);

  // Auto-expand on desktop, collapse on mobile
  useEffect(() => {
    setShowAdditionalMetrics(!isMobile);
  }, [isMobile]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    changePeriod(newPeriod);
    showSnackbar(`Switched to ${PERIOD_LABELS[newPeriod]} view`, "info");
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refresh(currentPeriod);
      showSnackbar("Analytics refreshed successfully", "success");
      loadAnalytics(currentPeriod);
    } catch (err) {
      showSnackbar("Failed to refresh analytics", "error");
    }
  };

  // Handle sync listings
  const handleSyncListings = async () => {
    try {
      await syncListings();
      // Success is handled by useEffect above
    } catch (err) {
      showSnackbar(
        err.message || "Failed to sync listings. Please try again.",
        "error"
      );
    }
  };

  // Show skeleton while loading initial data
  if (isLoading && !analytics) {
    return <DynamicSkeleton type="dashboard" />;
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 3 },
        minHeight: "100vh",
      }}
    >
      {/* Header with improved mobile layout */}
      <Fade in timeout={500}>
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Assessment
                sx={{
                  fontSize: { xs: 28, md: 32 },
                  color: theme.palette.primary.main,
                }}
              />
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                Analytics Dashboard
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {analytics?.lastCalculated && (
                <Chip
                  label={`Updated ${new Date(analytics.lastCalculated).toLocaleTimeString()}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Tooltip title="Sync your username and shop name to all your listings">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncListings}
                  disabled={isUpdating}
                  sx={{
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isUpdating ? "Syncing..." : "Sync Listings"}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Track your sales performance and business metrics
          </Typography>

          {/* Period indicator for mobile */}
          {isMobile && (
            <Chip
              label={`Viewing: ${PERIOD_LABELS[currentPeriod]}`}
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Fade>

      {/* Filter Bar with sticky positioning on mobile */}
      <Box
        sx={{
          position: { xs: "sticky", md: "relative" },
          top: { xs: 0, md: "auto" },
          zIndex: 10,
          backgroundColor: theme.palette.background.default,
          pt: { xs: 1, md: 0 },
          pb: 1,
          mb: 2,
        }}
      >
        <FilterBar
          period={currentPeriod}
          onPeriodChange={handlePeriodChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </Box>

      {/* No Data Alert */}
      {analytics && !analytics.lastCalculated && (
        <Fade in>
          <Alert severity="info" sx={{ mb: 3 }} icon={<InfoOutlined />}>
            Analytics data is being calculated. Please check back in a few
            minutes.
          </Alert>
        </Fade>
      )}

      {/* Shop Overview Metrics */}
      <Fade in timeout={500}>
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.secondary"
            sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Shop Overview
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
            {/* Shop Rating */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <StatCard
                title="Shop Rating"
                value={`${shop?.shopRating?.averageRating?.toFixed(1) || "0.0"} ⭐`}
                icon={<Star />}
                color="warning"
                subtitle={`${shop?.shopRating?.totalReviews || 0} reviews`}
                isLoading={!shop}
              />
            </Grid>

            {/* Total Views */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <StatCard
                title="Shop Views"
                value={formatNumber(shop?.shopMetrics?.totalViews || 0)}
                icon={<Visibility />}
                color="secondary"
                subtitle="total page visits"
                isLoading={!shop}
              />
            </Grid>

            {/* Total Products */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <StatCard
                title="Total Products"
                value={formatNumber(shop?.shopMetrics?.totalProducts || 0)}
                icon={<Storefront />}
                color="primary"
                subtitle="active listings"
                isLoading={!shop}
              />
            </Grid>

            {/* Total Sales (from shop metrics) */}
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2.4 }}>
              <StatCard
                title="All-Time Sales"
                value={formatNumber(shop?.shopMetrics?.totalSales || 0)}
                icon={<TrendingUp />}
                color="success"
                subtitle="total items sold"
                isLoading={!shop}
              />
            </Grid>

            {/* Total Revenue (from shop metrics) */}
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2.4 }}>
              <StatCard
                title="All-Time Revenue"
                value={formatCurrency(shop?.shopMetrics?.totalRevenue || 0)}
                icon={<AttachMoney />}
                color="info"
                subtitle="total earnings"
                isLoading={!shop}
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Period-based Sales Metrics */}
      <Fade in timeout={600}>
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.secondary"
            sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {PERIOD_LABELS[currentPeriod]} Performance
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
            {/* Period Revenue */}
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <StatCard
                title="Revenue"
                value={formatCurrency(analytics?.revenue?.total || 0)}
                change={analytics?.revenue?.growthRate}
                icon={<AttachMoney />}
                color="success"
                subtitle="vs previous period"
                isLoading={isLoading}
              />
            </Grid>

            {/* Period Orders */}
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <StatCard
                title="Orders"
                value={formatNumber(analytics?.orders?.total || 0)}
                icon={<ShoppingCart />}
                color="primary"
                subtitle={`${analytics?.orders?.completed || 0} completed`}
                isLoading={isLoading}
              />
            </Grid>

            {/* Period Sales */}
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <StatCard
                title="Items Sold"
                value={formatNumber(analytics?.sales?.count || 0)}
                icon={<TrendingUp />}
                color="info"
                subtitle="products sold"
                isLoading={isLoading}
              />
            </Grid>

            {/* Average Order Value */}
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(analytics?.orders?.averageValue || 0)}
                icon={<AttachMoney />}
                color="warning"
                subtitle="per order"
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Charts Section - Collapsible on Mobile */}
      <Fade in timeout={700}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Performance Charts
            </Typography>

            {isMobile && (
              <Tooltip title={showCharts ? "Hide charts" : "Show charts"}>
                <IconButton
                  size="small"
                  onClick={() => setShowCharts(!showCharts)}
                >
                  {showCharts ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Collapse in={showCharts}>
            <Grid container spacing={3}>
              {/* Revenue Chart - Full width on mobile */}
              <Grid size={{ xs: 12, md: 6 }}>
                <RevenueChart
                  data={analytics?.sales?.trend || []}
                  isLoading={isLoading}
                  title="Revenue Trend"
                  height={isMobile ? 280 : 350}
                />
              </Grid>

              {/* Orders Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <OrdersChart
                  data={analytics?.orders}
                  isLoading={isLoading}
                  title="Orders by Status"
                  height={isMobile ? 280 : 350}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Fade>

      {/* Additional Metrics - Collapsible on Mobile */}
      <Fade in timeout={800}>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Detailed Metrics
            </Typography>

            {isMobile && (
              <Tooltip
                title={showAdditionalMetrics ? "Hide details" : "Show details"}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    setShowAdditionalMetrics(!showAdditionalMetrics)
                  }
                >
                  {showAdditionalMetrics ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Collapse in={showAdditionalMetrics}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Pending Orders */}
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                  title="Pending Orders"
                  value={formatNumber(analytics?.orders?.pending || 0)}
                  icon={<ShoppingCart />}
                  color="warning"
                  subtitle="needs attention"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Active Listings */}
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                  title="Active Listings"
                  value={formatNumber(analytics?.listings?.totalActive || 0)}
                  icon={<Inventory />}
                  color="success"
                  subtitle="live products"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Low Stock */}
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                  title="Low Stock Items"
                  value={formatNumber(analytics?.listings?.lowStock || 0)}
                  icon={<Inventory />}
                  color="error"
                  subtitle="needs restocking"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Completed Orders */}
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                  title="Completed Orders"
                  value={formatNumber(analytics?.orders?.completed || 0)}
                  icon={<ShoppingCart />}
                  color="success"
                  subtitle="delivered"
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Fade>

      {/* Bottom spacing for mobile scroll */}
      <Box sx={{ pb: { xs: 4, md: 0 } }} />
    </Container>
  );
};

export default MerchantAnalyticsPage;
