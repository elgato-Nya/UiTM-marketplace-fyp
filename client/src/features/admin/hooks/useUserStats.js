import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../../hooks/useSnackbar";
import adminUserService from "../../../services/admin/userService";

/**
 * useUserStats Custom Hook
 *
 * PURPOSE: Manage user statistics for admin dashboard
 * FEATURES:
 * - Fetch comprehensive user statistics
 * - Auto-refresh capability
 * - Manual refresh
 * - Loading and error states
 *
 * RETURNS:
 * - stats: Object containing:
 *   - total: Total users count
 *   - active: Active users count
 *   - suspended: Suspended users count
 *   - unverified: Unverified users count
 *   - byRole: Breakdown by role (consumer, merchant, admin)
 *   - byCampus: Breakdown by campus
 *   - newUsersThisWeek: New registrations this week
 *   - newUsersThisMonth: New registrations this month
 */
const useUserStats = (autoRefresh = false, refreshInterval = 60000) => {
  const { showSnackbar } = useSnackbar();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(
    async (showLoadingState = true) => {
      try {
        if (showLoadingState) {
          setIsLoading(true);
        }
        setError(null);

        const response = await adminUserService.getUserStats();
        setStats(response.stats);
        setLastFetchTime(new Date());
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load user statistics. Please try again.";
        setError(errorMessage);

        // Only show error snackbar on manual refresh or initial load
        if (showLoadingState) {
          showSnackbar(errorMessage, "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Manual refresh statistics
   */
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchStats(false);
      showSnackbar("Statistics refreshed successfully", "success");
    } catch (err) {
      // Error already handled in fetchStats
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchStats, showSnackbar]);

  /**
   * Get percentage change for a metric
   */
  const getPercentageChange = useCallback((current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  /**
   * Get trend direction (up, down, stable)
   */
  const getTrend = useCallback(
    (current, previous) => {
      const change = getPercentageChange(current, previous);
      if (change > 0) return "up";
      if (change < 0) return "down";
      return "stable";
    },
    [getPercentageChange]
  );

  /**
   * Calculate growth rate for new users
   */
  const getGrowthRate = useCallback(() => {
    if (!stats) return null;

    return {
      weekly: stats.newUsersThisWeek || 0,
      monthly: stats.newUsersThisMonth || 0,
    };
  }, [stats]);

  /**
   * Get verification rate
   */
  const getVerificationRate = useCallback(() => {
    if (!stats || !stats.total) return 0;
    const verified = stats.total - (stats.unverified || 0);
    return ((verified / stats.total) * 100).toFixed(1);
  }, [stats]);

  /**
   * Get suspension rate
   */
  const getSuspensionRate = useCallback(() => {
    if (!stats || !stats.total) return 0;
    return (((stats.suspended || 0) / stats.total) * 100).toFixed(1);
  }, [stats]);

  /**
   * Get most popular campus
   */
  const getMostPopularCampus = useCallback(() => {
    if (!stats || !stats.byCampus) return null;

    const campuses = Object.entries(stats.byCampus);
    if (campuses.length === 0) return null;

    return campuses.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );
  }, [stats]);

  /**
   * Get role distribution percentages
   */
  const getRoleDistribution = useCallback(() => {
    if (!stats || !stats.byRole || !stats.total) return null;

    return {
      consumer: ((stats.byRole.consumer / stats.total) * 100).toFixed(1),
      merchant: ((stats.byRole.merchant / stats.total) * 100).toFixed(1),
      admin: ((stats.byRole.admin / stats.total) * 100).toFixed(1),
    };
  }, [stats]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchStats(false); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchStats]);

  return {
    // Raw stats
    stats,

    // Loading states
    isLoading,
    isRefreshing,
    error,
    lastFetchTime,

    // Actions
    refresh,
    fetchStats,

    // Calculated metrics
    getPercentageChange,
    getTrend,
    getGrowthRate,
    getVerificationRate,
    getSuspensionRate,
    getMostPopularCampus,
    getRoleDistribution,
  };
};

export default useUserStats;
