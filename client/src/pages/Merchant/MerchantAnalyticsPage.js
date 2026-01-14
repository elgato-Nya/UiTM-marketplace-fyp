import { useEffect, useState } from "react";
import {
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
  BarChart,
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

  // Collapsible sections state - all open by default
  const [showShopOverview, setShowShopOverview] = useState(true);
  const [showPeriodPerformance, setShowPeriodPerformance] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [showInventory, setShowInventory] = useState(true);

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

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    changePeriod(newPeriod);
    showSnackbar(`Switched to ${PERIOD_LABELS[newPeriod]} view`, "info");
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      // Refresh all periods analytics data
      await refresh("all");
      showSnackbar("Analytics refreshed successfully", "success");
      // Reload shop to get updated all-time revenue
      loadMyShop();
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
    <Box>
      {/* Header with improved mobile layout */}
      <Fade in timeout={500}>
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
              >
                Analytics Dashboard
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8125rem", md: "0.875rem" } }}
              >
                Track your sales performance and business metrics
              </Typography>
            </Box>

            {/* Action Buttons - Mobile Friendly */}
            {!isMobile && (
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
            )}
          </Stack>
        </Box>
      </Fade>

      {/* Filter Bar */}
      <Box sx={{ mb: 2 }}>
        <FilterBar
          period={currentPeriod}
          onPeriodChange={handlePeriodChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={analytics?.lastCalculated}
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

      {/* Mobile Only: Sync Listings Button */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SyncIcon />}
            onClick={handleSyncListings}
            disabled={isUpdating}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isUpdating ? "Syncing..." : "Sync Listings"}
          </Button>
        </Box>
      )}

      {/* Shop Overview Metrics */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="600"
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: { xs: "0.75rem", md: "0.8125rem" },
              }}
            >
              Shop Overview
            </Typography>
            <Tooltip title={showShopOverview ? "Hide section" : "Show section"}>
              <IconButton
                size="small"
                onClick={() => setShowShopOverview(!showShopOverview)}
              >
                {showShopOverview ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={showShopOverview}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {/* Shop Rating */}
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                <StatCard
                  title="Shop Rating"
                  value={`${shop?.shopRating?.averageRating?.toFixed(1) || "0.0"}`}
                  icon={Star}
                  color="warning"
                  subtitle={`${shop?.shopRating?.totalReviews || 0} reviews`}
                  isLoading={!shop}
                />
              </Grid>

              {/* Total Views */}
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <StatCard
                  title="Shop Views"
                  value={formatNumber(shop?.shopMetrics?.totalViews || 0)}
                  icon={Visibility}
                  color="secondary"
                  subtitle="total page visits"
                  isLoading={!shop}
                />
              </Grid>

              {/* Total Listings */}
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <StatCard
                  title="Total Listings"
                  value={formatNumber(shop?.shopMetrics?.totalProducts || 0)}
                  icon={Storefront}
                  color="primary"
                  subtitle="active listings"
                  isLoading={!shop}
                />
              </Grid>

              {/* Total Revenue */}
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <StatCard
                  title="All-Time Revenue"
                  value={formatCurrency(shop?.shopMetrics?.totalRevenue || 0)}
                  icon={AttachMoney}
                  color="success"
                  subtitle="total earnings"
                  isLoading={!shop}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Fade>

      {/* Period-based Sales Metrics */}
      <Fade in timeout={600}>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="600"
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: { xs: "0.75rem", md: "0.8125rem" },
              }}
            >
              {PERIOD_LABELS[currentPeriod]} Performance
            </Typography>
            <Tooltip
              title={showPeriodPerformance ? "Hide section" : "Show section"}
            >
              <IconButton
                size="small"
                onClick={() => setShowPeriodPerformance(!showPeriodPerformance)}
              >
                {showPeriodPerformance ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={showPeriodPerformance}>
            <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 2 }}>
              {/* Revenue */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Revenue"
                  value={formatCurrency(analytics?.revenue?.total || 0)}
                  change={analytics?.revenue?.growthRate}
                  icon={AttachMoney}
                  color="success"
                  subtitle="vs previous period"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Period Orders */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Orders"
                  value={formatNumber(analytics?.orders?.total || 0)}
                  icon={ShoppingCart}
                  color="primary"
                  subtitle={`${analytics?.orders?.completed || 0} completed`}
                  isLoading={isLoading}
                />
              </Grid>

              {/* Period Sales */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Items Sold"
                  value={formatNumber(analytics?.sales?.count || 0)}
                  icon={TrendingUp}
                  color="info"
                  subtitle="products sold"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Average Order Value */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Avg Order Value"
                  value={formatCurrency(analytics?.orders?.averageValue || 0)}
                  icon={AttachMoney}
                  color="warning"
                  subtitle="per order"
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Fade>

      {/* Charts Section */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BarChart sx={{ color: theme.palette.primary.main }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Performance Charts
              </Typography>
            </Box>

            <Tooltip title={showCharts ? "Hide charts" : "Show charts"}>
              <IconButton
                size="small"
                onClick={() => setShowCharts(!showCharts)}
              >
                {showCharts ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
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

      {/* Additional Metrics */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Inventory sx={{ color: theme.palette.primary.main }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Inventory & Orders
              </Typography>
            </Box>

            <Tooltip title={showInventory ? "Hide section" : "Show section"}>
              <IconButton
                size="small"
                onClick={() => setShowInventory(!showInventory)}
              >
                {showInventory ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>

          <Collapse in={showInventory}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Pending Orders */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Pending Orders"
                  value={formatNumber(analytics?.orders?.pending || 0)}
                  icon={ShoppingCart}
                  color="warning"
                  subtitle="needs attention"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Completed Orders */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Active Listings"
                  value={formatNumber(analytics?.listings?.totalActive || 0)}
                  icon={Inventory}
                  color="success"
                  subtitle="live products"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Low Stock */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Low Stock Items"
                  value={formatNumber(analytics?.listings?.lowStock || 0)}
                  icon={Inventory}
                  color="error"
                  subtitle="needs restocking"
                  isLoading={isLoading}
                />
              </Grid>

              {/* Completed Orders */}
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  title="Completed Orders"
                  value={formatNumber(analytics?.orders?.completed || 0)}
                  icon={ShoppingCart}
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
    </Box>
  );
};

export default MerchantAnalyticsPage;
