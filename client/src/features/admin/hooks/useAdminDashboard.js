import { useState, useEffect, useCallback, useRef } from "react";
import adminDashboardService from "../service/adminDashboardService";
import { useSnackbar } from "../../../hooks/useSnackbar";

/**
 * useAdminDashboard Hook
 *
 * PURPOSE: Manage admin dashboard state and data fetching
 * FEATURES:
 * - Auto-refresh every 30 seconds
 * - Manual refresh with rate limiting
 * - Error handling and notifications
 * - Loading states
 *
 * PATTERN: Follows useMerchantAnalytics pattern
 */
const useAdminDashboard = () => {
  const { showSnackbar } = useSnackbar();
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Ref for auto-refresh interval
  const autoRefreshInterval = useRef(null);

  /**
   * Load all dashboard data
   */
  const loadDashboard = useCallback(
    async (showLoadingState = true) => {
      try {
        if (showLoadingState) {
          setIsLoading(true);
        }
        setError(null);

        // Fetch all data in parallel
        const [overviewData, healthData, verificationsData] = await Promise.all(
          [
            adminDashboardService.getOverview(),
            adminDashboardService.getHealthSummary(),
            adminDashboardService.getPendingVerifications(),
          ]
        );

        // Data is already extracted by the service (response.data)
        // Backend spreads data directly in response, no nested .data property
        setOverview(overviewData);
        setHealth(healthData);
        setPendingVerifications(verificationsData);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load dashboard data. Please try again.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Manual refresh with rate limiting feedback
   */
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Attempt to refresh analytics on backend
      await adminDashboardService.refreshAnalytics("all");

      // Reload dashboard data
      await loadDashboard(false);

      setLastRefreshTime(new Date());
      showSnackbar("Dashboard refreshed successfully", "success");
    } catch (err) {
      // Handle rate limit error specifically
      if (err.response?.status === 429) {
        const errorMessage =
          err.response?.data?.message ||
          "Too many refresh requests. Please wait before trying again.";
        showSnackbar(errorMessage, "warning");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to refresh dashboard";
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDashboard, showSnackbar]);

  /**
   * Change current period view
   */
  const changePeriod = useCallback((newPeriod) => {
    setCurrentPeriod(newPeriod);
  }, []);

  /**
   * Get period-specific data from overview
   */
  const getPeriodData = useCallback(() => {
    if (!overview) return null;

    switch (currentPeriod) {
      case "week":
        return overview.week;
      case "month":
        return overview.month;
      case "year":
        return overview.year;
      default:
        return overview.week;
    }
  }, [overview, currentPeriod]);

  // Initial load only - no auto-refresh to reduce server load
  useEffect(() => {
    // Load dashboard immediately on mount
    loadDashboard();

    // No auto-refresh - admin can manually refresh using the button or reload the page
    // This reduces unnecessary API calls and server load on t2.micro instance

    // Cleanup interval ref on unmount (if any)
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return {
    overview,
    health,
    pendingVerifications,
    currentPeriod,
    periodData: getPeriodData(),
    isLoading,
    isRefreshing,
    error,
    lastRefreshTime,
    loadDashboard,
    refresh,
    changePeriod,
  };
};

export default useAdminDashboard;
