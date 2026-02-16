import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePayoutSettings,
  updateBankDetails,
  requestPayout,
  cancelPayout,
} from "../store/payoutSlice";

/**
 * usePayoutActions - Hook for payout mutations
 *
 * PURPOSE: Handle payout actions with consistent return format
 * PATTERN: Similar to useQuoteActions
 *
 * @returns {Object} - Action functions
 */
export function usePayoutActions() {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.payout);

  // Update payout settings
  const handleUpdateSettings = useCallback(
    async (settingsData) => {
      try {
        const result = await dispatch(
          updatePayoutSettings(settingsData),
        ).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to update payout settings",
        };
      }
    },
    [dispatch],
  );

  // Update bank details
  const handleUpdateBankDetails = useCallback(
    async (bankData) => {
      try {
        const result = await dispatch(updateBankDetails(bankData)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to update bank details",
        };
      }
    },
    [dispatch],
  );

  // Request payout
  const handleRequestPayout = useCallback(
    async (payoutData = {}) => {
      try {
        const result = await dispatch(requestPayout(payoutData)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to request payout",
        };
      }
    },
    [dispatch],
  );

  // Cancel payout
  const handleCancelPayout = useCallback(
    async (payoutId) => {
      try {
        const result = await dispatch(cancelPayout(payoutId)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to cancel payout",
        };
      }
    },
    [dispatch],
  );

  return {
    isSubmitting,
    updateSettings: handleUpdateSettings,
    updateBankDetails: handleUpdateBankDetails,
    requestPayout: handleRequestPayout,
    cancelPayout: handleCancelPayout,
  };
}
