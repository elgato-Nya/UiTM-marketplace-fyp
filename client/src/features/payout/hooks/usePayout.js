import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBalance,
  fetchPayoutHistory,
  clearError,
} from "../store/payoutSlice";

/**
 * usePayout - Main hook for payout management
 *
 * PURPOSE: Fetch and manage payout balance and settings
 * PATTERN: Similar to useOrders
 *
 * @returns {Object} - balance, settings, transactions, and actions
 */
export function usePayout() {
  const dispatch = useDispatch();

  const {
    balance,
    payoutSettings,
    bankDetails,
    canRequestPayout,
    daysUntilForcedPayout,
    nextScheduledPayout,
    transactions,
    payoutHistory,
    isLoading,
    error,
  } = useSelector((state) => state.payout);

  // Load balance
  const loadBalance = useCallback(
    (params = {}) => {
      dispatch(fetchBalance(params));
    },
    [dispatch],
  );

  // Load payout history
  const loadPayoutHistory = useCallback(
    (params = {}) => {
      dispatch(fetchPayoutHistory(params));
    },
    [dispatch],
  );

  // Clear error
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load on mount
  useEffect(() => {
    loadBalance();
    loadPayoutHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Balance data
    balance,
    payoutSettings,
    bankDetails,
    canRequestPayout,
    daysUntilForcedPayout,
    nextScheduledPayout,
    transactions,

    // Payout history
    payoutHistory,

    // State
    isLoading,
    error,

    // Actions
    loadBalance,
    loadPayoutHistory,
    clearError: clearErrorMessage,
  };
}
