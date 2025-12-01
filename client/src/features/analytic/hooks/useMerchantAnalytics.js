import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMerchantAnalytics,
  fetchMerchantOverview,
  fetchQuickStats,
  refreshMerchantAnalytics,
  setCurrentPeriod,
  setFilters,
  clearFilters,
  clearError,
} from "../store/analyticsSlice";

/**
 * useMerchantAnalytics Hook
 *
 * PURPOSE: Manage merchant analytics data fetching and state
 * PATTERN: Matches useOrders.js pattern
 *
 * @param {string} defaultPeriod - Initial period ('week', 'month', 'year')
 * @returns {Object} Analytics data, loading states, and actions
 */
export function useMerchantAnalytics(defaultPeriod = "week") {
  const dispatch = useDispatch();

  const {
    currentPeriod,
    weekAnalytics,
    monthAnalytics,
    yearAnalytics,
    overview,
    quickStats,
    filters,
    isLoading,
    isRefreshing,
    error,
  } = useSelector((state) => state.analytics);

  // Get current period analytics
  const getCurrentAnalytics = useCallback(() => {
    switch (currentPeriod) {
      case "week":
        return weekAnalytics;
      case "month":
        return monthAnalytics;
      case "year":
        return yearAnalytics;
      default:
        return weekAnalytics;
    }
  }, [currentPeriod, weekAnalytics, monthAnalytics, yearAnalytics]);

  // Load analytics for specific period
  const loadAnalytics = useCallback(
    (period = currentPeriod) => {
      dispatch(fetchMerchantAnalytics(period));
    },
    [dispatch, currentPeriod]
  );

  // Load overview (all periods)
  const loadOverview = useCallback(() => {
    dispatch(fetchMerchantOverview());
  }, [dispatch]);

  // Load quick stats
  const loadQuickStats = useCallback(() => {
    dispatch(fetchQuickStats());
  }, [dispatch]);

  // Refresh analytics manually
  const refresh = useCallback(
    (period = "all") => {
      return dispatch(refreshMerchantAnalytics(period));
    },
    [dispatch]
  );

  // Change current period
  const changePeriod = useCallback(
    (period) => {
      dispatch(setCurrentPeriod(period));

      // Load analytics if not already loaded
      const periodData =
        period === "week"
          ? weekAnalytics
          : period === "month"
            ? monthAnalytics
            : yearAnalytics;

      if (!periodData) {
        dispatch(fetchMerchantAnalytics(period));
      }
    },
    [dispatch, weekAnalytics, monthAnalytics, yearAnalytics]
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  // Clear filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Auto-load analytics on mount
  useEffect(() => {
    if (!getCurrentAnalytics() && !isLoading) {
      loadAnalytics(defaultPeriod);
    }
  }, [defaultPeriod]); // Only run on mount

  return {
    // Data
    analytics: getCurrentAnalytics(),
    weekAnalytics,
    monthAnalytics,
    yearAnalytics,
    overview,
    quickStats,
    currentPeriod,
    filters,

    // States
    isLoading,
    isRefreshing,
    error,

    // Actions
    loadAnalytics,
    loadOverview,
    loadQuickStats,
    refresh,
    changePeriod,
    updateFilters,
    resetFilters,
    clearError: handleClearError,
  };
}
